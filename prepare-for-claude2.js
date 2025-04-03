const fs = require('fs').promises;
const path = require('path');

// Function to check if a file is a media file
function isMediaFile(filename) {
    const mediaExtensions = [
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'ico', 'svg',
        // Videos
        'mp4', 'webm', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v',
        // Audio
        'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac',
        // Other media
        'pdf', 'psd', 'ai', 'eps'
    ];
    const ext = path.extname(filename).toLowerCase().slice(1);
    return mediaExtensions.includes(ext);
}

// Function to read and parse .gitignore file
async function getGitignorePatterns(rootPath) {
    try {
        const gitignoreContent = await fs.readFile(path.join(rootPath, '.gitignore'), 'utf8');
        return gitignoreContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
    } catch (error) {
        return []; // Return empty array if .gitignore doesn't exist
    }
}

function shouldIgnorePath(path, patterns) {
    return patterns.some(pattern => {
        pattern = pattern.replace(/^\/|\/$/g, '');
        pattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${pattern}$|/${pattern}$|/${pattern}/|^${pattern}/`);
        return regex.test(path);
    });
}

function shouldIgnoreFile(filename, relativePath, gitignorePatterns) {
    return filename === 'yarn.lock' ||
           filename === 'claude-input.md' ||
           filename === 'project-structure.txt' ||
           isMediaFile(filename) ||
           shouldIgnorePath(relativePath, gitignorePatterns);
}

function shouldIgnoreFolder(folderName, relativePath, gitignorePatterns) {
    return folderName === 'node_modules' || 
           folderName.startsWith('.') ||
           folderName === 'public' ||
           folderName === 'content' ||
           folderName === 'components' ||
           folderName === 'page_components' ||
           folderName === 'app/.tests' ||
           folderName === 'app/analytics2' ||
           folderName === 'app/blog' ||
           folderName === 'app/create2' ||           
           folderName === 'app/create2b' ||           
           folderName === 'app/create3' ||           
           folderName === 'app/create3b' ||           
           folderName === 'app/create4' ||           
           folderName === 'app/lobby' ||           
           folderName === 'app/onboarding' ||           
           folderName === 'app/api/.tests' ||           
           folderName === 'app/api/.giveaways' ||           
           folderName === 'app/api/.hello' ||           
           folderName === 'app/api/.mqtt' ||           
           folderName === 'app/api/.onboarding' ||           
           folderName === 'app/api/.rps' ||           
           folderName === 'services/socials' ||           
           folderName === 'styles' ||           
           folderName === 'api-lib' ||  
           folderName === 'app/[username]' ||         
           folderName === 'app' ||         
           folderName === 'services' ||         
        //    folderName === 'lib' ||         
           shouldIgnorePath(relativePath, gitignorePatterns);
}

// New function to minify code based on file type
function minifyContent(content, extension) {
    switch(extension.toLowerCase()) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return minifyJS(content);
        case 'css':
            return minifyCSS(content);
        case 'html':
            return minifyHTML(content);
        default:
            return content;
    }
}

function minifyJS(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around braces
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*=\s*/g, '=')
        .replace(/^\s+|\s+$/g, ''); // Trim start and end
}

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*,\s*/g, ',')
        .replace(/^\s+|\s+$/g, ''); // Trim start and end
}

function minifyHTML(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/>\s+</g, '><') // Remove spaces between tags
        .replace(/^\s+|\s+$/g, ''); // Trim start and end
}

async function processDirectory(dirPath, gitignorePatterns, basePath = '') {
    let output = '';
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    // First add the file structure
    output += 'File Structure:\n```\n';
    const structure = await getFileStructure(dirPath, gitignorePatterns);
    output += structure + '\n```\n\n';
    
    // Then add the contents of each file
    output += 'File Contents:\n\n';
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.join(basePath, item.name);
        
        if (item.isDirectory()) {
            if (!shouldIgnoreFolder(item.name, relativePath, gitignorePatterns)) {
                output += await processDirectory(fullPath, gitignorePatterns, relativePath);
            }
        } else {
            if (!shouldIgnoreFile(item.name, relativePath, gitignorePatterns)) {
                const content = await fs.readFile(fullPath, 'utf8');
                const extension = path.extname(item.name).slice(1);
                const minifiedContent = minifyContent(content, extension);
                output += `File: ${relativePath}\n\`\`\`${extension}\n${minifiedContent}\n\`\`\`\n\n`;
            }
        }
    }
    
    return output;
}

async function getFileStructure(dirPath, gitignorePatterns, prefix = '', basePath = '') {
    let output = '';
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
        const relativePath = path.join(basePath, item.name);
        
        if (item.isDirectory() && shouldIgnoreFolder(item.name, relativePath, gitignorePatterns)) {
            continue;
        }
        if (!item.isDirectory() && shouldIgnoreFile(item.name, relativePath, gitignorePatterns)) {
            continue;
        }
        
        output += `${prefix}${item.isDirectory() ? '├── ' : '└── '}${item.name}\n`;
        if (item.isDirectory()) {
            output += await getFileStructure(
                path.join(dirPath, item.name),
                gitignorePatterns,
                prefix + '│   ',
                relativePath
            );
        }
    }
    
    return output;
}

// Usage
async function main() {
    try {
        const folderPath = process.argv[2] || 'models';
        const gitignorePatterns = await getGitignorePatterns(process.cwd());
        const output = await processDirectory(folderPath, gitignorePatterns);
        await fs.writeFile('claude-input.md', output);
        console.log('Successfully created claude-input.md');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();