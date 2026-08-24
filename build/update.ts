import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_OWNER = 'easyeda';
const GITHUB_REPO = 'pro-api-sdk';
const GITHUB_BRANCH = 'master';

const GITEE_OWNER = 'jlceda';
const GITEE_REPO = 'pro-api-sdk';
const GITEE_BRANCH = 'master';

const GITHUB_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
const GITEE_BASE_URL = `https://raw.giteeusercontent.com/${GITEE_OWNER}/${GITEE_REPO}/raw/${GITEE_BRANCH}`;
const PROJECT_ROOT = path.resolve(__dirname, '../');

interface SdkManifest {
	version: string;
	frameworkFiles: string[];
}

interface DownloadedFrameworkFile {
	content: string;
	filePath: string;
	fullPath: string;
}

/**
 * 仅允许项目目录内的普通相对文件，避免远端清单通过路径穿越覆盖任意位置。
 */
function resolveFrameworkFilePath(filePath: unknown): string | null {
	if (typeof filePath !== 'string' || !filePath || filePath.includes('\0')) {
		return null;
	}

	const normalizedPath = filePath.replaceAll('\\', '/');
	if (path.posix.isAbsolute(normalizedPath)) {
		return null;
	}

	const resolvedPath = path.resolve(PROJECT_ROOT, normalizedPath);
	const relativePath = path.relative(PROJECT_ROOT, resolvedPath);
	if (!relativePath || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
		return null;
	}

	return resolvedPath;
}

function isSdkManifest(value: unknown): value is SdkManifest {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const manifest = value as Partial<SdkManifest>;
	return typeof manifest.version === 'string'
		&& Array.isArray(manifest.frameworkFiles)
		&& manifest.frameworkFiles.every(filePath => resolveFrameworkFilePath(filePath) !== null);
}

/**
 * 获取本地 manifest
 */
function getLocalManifest(): SdkManifest | null {
	const manifestPath = path.join(__dirname, '../.sdk-manifest.json');
	if (!fs.existsSync(manifestPath)) {
		return null;
	}
	return fs.readJsonSync(manifestPath);
}

/**
 * 从指定 URL 获取 JSON
 */
async function fetchJson<T>(url: string): Promise<T | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return null;
		}
		return await response.json();
	}
	catch {
		return null;
	}
}

/**
 * 从指定 URL 获取文本
 */
async function fetchText(url: string): Promise<string | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return null;
		}
		return await response.text();
	}
	catch {
		return null;
	}
}

/**
 * 获取远程 manifest（带回退）
 */
async function getRemoteManifest(): Promise<SdkManifest | null> {
	// 先尝试 GitHub
	const githubUrl = `${GITHUB_BASE_URL}/.sdk-manifest.json`;
	let manifest = await fetchJson<unknown>(githubUrl);

	if (isSdkManifest(manifest)) {
		console.log('[GitHub] Manifest fetched successfully');
		return manifest;
	}

	// GitHub 失败，回退到 Gitee
	console.log('[GitHub] Failed to fetch manifest, trying Gitee...');
	const giteeUrl = `${GITEE_BASE_URL}/.sdk-manifest.json`;
	manifest = await fetchJson<unknown>(giteeUrl);

	if (isSdkManifest(manifest)) {
		console.log('[Gitee] Manifest fetched successfully');
		return manifest;
	}

	console.error('Failed to fetch remote manifest from GitHub or Gitee');
	return null;
}

/**
 * 智能合并 package.json
 */
function mergePackageJson(local: any, remote: any): any {
	const result = { ...local };

	// 版本号使用远程
	result.version = remote.version;

	// 合并 scripts（远程覆盖本地）
	if (remote.scripts) {
		result.scripts = {
			...local.scripts,
			...remote.scripts,
		};
	}

	// 合并 devDependencies（远程覆盖本地）
	if (remote.devDependencies) {
		result.devDependencies = {
			...local.devDependencies,
			...remote.devDependencies,
		};
	}

	// 合并 dependencies（远程覆盖本地）
	if (remote.dependencies) {
		result.dependencies = {
			...local.dependencies,
			...remote.dependencies,
		};
	}

	return result;
}

/**
 * 下载并校验框架文件（带回退），成功后由更新流程统一写入。
 */
async function fetchFrameworkFile(filePath: string): Promise<DownloadedFrameworkFile | null> {
	const fullPath = resolveFrameworkFilePath(filePath);
	if (!fullPath) {
		console.error(`Rejected unsafe framework file path: ${filePath}`);
		return null;
	}

	// 先尝试 GitHub
	const githubUrl = `${GITHUB_BASE_URL}/${filePath}`;
	let content = await fetchText(githubUrl);

	if (content !== null) {
		console.log(`[GitHub] Downloaded: ${filePath}`);
	}
	else {
		// GitHub 失败，回退到 Gitee
		console.log(`[GitHub] Download failed, trying Gitee: ${filePath}`);
		const giteeUrl = `${GITEE_BASE_URL}/${filePath}`;
		content = await fetchText(giteeUrl);

		if (content !== null) {
			console.log(`[Gitee] Downloaded: ${filePath}`);
		}
		else {
			console.error(`Download failed: ${filePath}`);
			return null;
		}
	}

	return { content, filePath, fullPath };
}

/**
 * 检查更新
 */
async function checkUpdate(): Promise<{ hasUpdate: boolean; localVersion: string | null; remoteVersion: string | null }> {
	const localManifest = getLocalManifest();
	const remoteManifest = await getRemoteManifest();

	if (!remoteManifest) {
		console.log('Unable to fetch remote manifest');
		return { hasUpdate: false, localVersion: localManifest?.version ?? null, remoteVersion: null };
	}

	const localVersion = localManifest?.version ?? null;
	const remoteVersion = remoteManifest.version;

	if (!localVersion) {
		console.log(`New version found: ${remoteVersion}`);
		return { hasUpdate: true, localVersion: null, remoteVersion };
	}

	if (localVersion === remoteVersion) {
		console.log(`Already up to date: ${localVersion}`);
		return { hasUpdate: false, localVersion, remoteVersion };
	}

	console.log(`New version found: ${localVersion} → ${remoteVersion}`);
	return { hasUpdate: true, localVersion, remoteVersion };
}

/**
 * 执行更新
 */
async function performUpdate() {
	const localManifest = getLocalManifest();
	const remoteManifest = await getRemoteManifest();

	if (!remoteManifest) {
		console.error('Failed to fetch remote manifest, update failed');
		return false;
	}

	// 检查是否有更新
	if (localManifest && localManifest.version === remoteManifest.version) {
		console.log(`Already up to date: ${localManifest.version}`);
		return true;
	}

	console.log(`Starting update: ${localManifest?.version ?? 'unknown'} → ${remoteManifest.version}`);

	const packageJsonPath = path.join(__dirname, '../package.json');
	const localPackageJson = fs.readJsonSync(packageJsonPath);

	// 先尝试 GitHub 获取 package.json
	let remotePackageJson = await fetchJson<any>(`${GITHUB_BASE_URL}/package.json`);
	if (!remotePackageJson) {
		console.log('[GitHub] Failed to fetch package.json, trying Gitee...');
		remotePackageJson = await fetchJson<any>(`${GITEE_BASE_URL}/package.json`);
	}

	if (!remotePackageJson) {
		console.error('Failed to fetch remote package.json');
		return false;
	}

	// 所有远端文件均验证、下载成功后才开始写入，避免留下半更新状态。
	const downloadedFrameworkFiles: DownloadedFrameworkFile[] = [];
	for (const filePath of remoteManifest.frameworkFiles) {
		const downloadedFile = await fetchFrameworkFile(filePath);
		if (!downloadedFile) {
			console.error('Framework update aborted because a required file could not be downloaded');
			return false;
		}
		downloadedFrameworkFiles.push(downloadedFile);
	}

	// 备份 package.json
	const packageJsonBackupPath = path.join(__dirname, '../package.json.backup');
	fs.copySync(packageJsonPath, packageJsonBackupPath);
	console.log('Backed up package.json → package.json.backup');

	// 智能合并 package.json
	const mergedPackageJson = mergePackageJson(localPackageJson, remotePackageJson);
	fs.writeJsonSync(packageJsonPath, mergedPackageJson, { spaces: '\t', EOL: '\n' });
	console.log('Merged package.json');

	// 下载框架文件
	for (const { content, filePath, fullPath } of downloadedFrameworkFiles) {
		fs.ensureDirSync(path.dirname(fullPath));
		fs.writeFileSync(fullPath, content, 'utf-8');
		console.log(`Updated: ${filePath}`);
	}

	// 更新 manifest
	fs.writeJsonSync(path.join(__dirname, '../.sdk-manifest.json'), remoteManifest, { spaces: '\t', EOL: '\n' });
	console.log('Updated .sdk-manifest.json');

	console.log('Update complete!');
	return true;
}

/**
 * 主函数
 */
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (command === 'check') {
		await checkUpdate();
	}
	else if (command === 'update') {
		await performUpdate();
	}
	else {
		console.log('Usage:');
		console.log('  npm run update:check  - Check for updates');
		console.log('  npm run update        - Perform update');
	}
}

main().catch((err) => {
	console.error('Error occurred:', err);
	process.exit(1);
});
