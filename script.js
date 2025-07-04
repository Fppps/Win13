document.addEventListener('DOMContentLoaded', () => {
    // --- VFS & State Management ---
    // VFS (Virtual File System) structure. Each key is a folder or file.
    // Files store their content directly as strings.
    let vfs = {
        'C:': {
            'Users': {
                'You': {
                    'Desktop': {
                        'welcome.txt': 'Welcome to Windows 13 Concept! This is a simple text file. You can create more .txt or .py files using the "New File" button in File Explorer.',
                        'hello.py': 'print("Hello, Windows 13!")\\n\\ndef greet(name):\\n    return f"Hello, {name}!"\\n\\nprint(greet("AI User"))'
                    },
                    'Documents': {}
                }
            }
        }
    };
    let currentPath = "C:/Users/You/Desktop";
    let currentOpenFile = { path: null, name: null }; // Tracks the file currently open in the text editor
    let recentFiles = JSON.parse(localStorage.getItem('recentFiles')) || []; // Load recent files from local storage
    let activeUser = localStorage.getItem('win13_active_user'); // Track currently logged-in user

    // --- DOM Elements ---
    const loginContainer = document.getElementById('login-container');
    const loginView = document.getElementById('login-view');
    const createAccountView = document.getElementById('create-account-view');
    const signInBtn = document.getElementById('sign-in-btn');
    const showCreateAccountBtn = document.getElementById('show-create-account-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const createAccountBtn = document.getElementById('create-account-btn');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    const disclaimerOkBtn = document.getElementById('disclaimer-ok-btn');
    const desktop = document.getElementById('desktop');
    const bootSound = document.getElementById('boot-sound');
    const fileExplorerOutput = document.getElementById('file-explorer-output');
    const newFileBtn = document.getElementById('new-file-btn');
    const terminalOutput = document.getElementById('terminal-output');
    const cpuRegistersDisplay = document.getElementById('cpu-registers');
    const memoryDisplay = document.getElementById('memory-display');
    const programEditor = document.getElementById('program-editor');
    const loadProgramBtn = document.getElementById('load-program-btn');
    const runProgramBtn = document = document.getElementById('run-program-btn');
    const stepProgramBtn = document.getElementById('step-program-btn');
    const resetCpuBtn = document.getElementById('reset-cpu-btn');

    // Text Editor DOM elements
    const textEditorWindow = document.getElementById('text-editor-window');
    const textEditorTitle = document.getElementById('text-editor-title');
    const textEditorIcon = document.getElementById('text-editor-icon');
    const textEditorTextarea = document.getElementById('text-editor-textarea');
    const saveFileBtn = document.getElementById('save-file-btn');

    // Context Menu DOM elements
    const desktopContextMenu = document.getElementById('context-menu'); // Renamed for clarity
    const openSettingsContextBtn = document.getElementById('open-settings-context');
    const newStickyNoteContextBtn = document.getElementById('new-sticky-note-context'); // New sticky note context menu item
    const fileExplorerContextMenu = document.getElementById('file-explorer-context-menu'); // New file explorer context menu
    const feRenameContextBtn = document.getElementById('fe-rename-context');
    const feDeleteContextBtn = document.getElementById('fe-delete-context');
    let activeFileExplorerItem = null; // To store the path of the item right-clicked in FE

    // Clock DOM elements
    const timeDisplayElement = document.getElementById('time-display'); // New element for time
    const dateDisplayElement = document.getElementById('date-display'); // New element for date
    const yearDisplayElement = document.getElementById('year-display'); // Get the new year display element

    // Settings DOM elements
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsContents = document.querySelectorAll('.settings-content');
    const setLightBgBtn = document.getElementById('set-light-bg');
    const setDarkBgBtn = document.getElementById('set-dark-bg');
    const bgColorPicker = document.getElementById('bgColorPicker');

    // Start Menu Quick Access
    const quickAccessContent = document.getElementById('quick-access-content');
    const startMenuBtn = document.getElementById('start-menu-btn');
    const startMenu = document.getElementById('start-menu');
    const startMenuUsername = document.getElementById('start-menu-username');
    const powerOptionsBtn = document.getElementById('power-options-btn');
    const powerOptionsMenu = document.getElementById('power-options-menu');
    const signOutBtn = document.getElementById('sign-out-btn');
    const restartBtn = document.getElementById('restart-btn');
    const shutdownBtn = document.getElementById('shutdown-btn'); // New shutdown button
    const powerOffScreen = document.getElementById('power-off-screen'); // Power off screen
    const powerOffMessage = document.getElementById('power-off-message'); // Power off message
    const startMenuInstallableApps = document.getElementById('start-menu-installable-apps'); // For dynamically adding apps

    // Calculator DOM elements
    const calculatorDisplay = document.getElementById('calculator-display');
    const calculatorKeypad = document.getElementById('calculator-keypad');
    let currentInput = '0';
    let operator = null;
    let firstOperand = null;
    let waitingForSecondOperand = false;

    // Task Manager DOM elements
    const taskManagerWindow = document.getElementById('task-manager-window');
    const processListDiv = document.getElementById('process-list');
    const refreshProcessesBtn = document.getElementById('refresh-processes-btn');
    const endTaskBtn = document.getElementById('end-task-btn');
    let selectedProcessId = null; // To track the currently selected process for "End Task"

    // Sticky Notes DOM elements
    const stickyNotesContainer = document.getElementById('sticky-notes-container');
    let stickyNotes = JSON.parse(localStorage.getItem('stickyNotes')) || []; // Load notes

    // Updater Hub DOM elements
    const availableUpdatesList = document.getElementById('available-updates-list');
    const installationLog = document.getElementById('installation-log');
    let installedApps = JSON.parse(localStorage.getItem('installedApps')) || {}; // Track installed apps

    // Desktop Icons DOM elements
    const desktopIconsContainer = document.getElementById('desktop-icons-container');
    const toggleDesktopIconsContextBtn = document.getElementById('toggle-desktop-icons-context');
    let showDesktopIcons = localStorage.getItem('showDesktopIcons') === 'true'; // State for desktop icon visibility

    // Calendar DOM elements
    const calendarWindow = document.getElementById('calendar-window');
    const currentMonthYearDisplay = document.getElementById('current-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    let currentCalendarDate = new Date(); // State for calendar display

    // Installable applications definition
    const installableApplications = {
        'file-explorer': { name: 'File Explorer', windowId: 'file-explorer-window', icon: 'folder', color: 'text-yellow-500', isCore: true, installed: true, desktopIcon: true },
        'terminal': { name: 'Terminal', windowId: 'terminal-window', icon: 'terminal', color: '', isCore: true, installed: true, desktopIcon: true },
        'text-editor': { name: 'Notepad', windowId: 'text-editor-window', icon: 'edit_note', color: 'text-lime-400', isCore: true, installed: true, desktopIcon: true },
        'settings': { name: 'Settings', windowId: 'settings-window', icon: 'settings', color: '', isCore: true, installed: true, desktopIcon: false },
        'cpu-monitor': { name: 'CPU Monitor', windowId: 'cpu-monitor-window', icon: 'developer_board', color: 'text-purple-400', isCore: true, installed: true, desktopIcon: true },
        'calculator': { name: 'Calculator', windowId: 'calculator-window', icon: 'calculate', color: 'text-orange-400', isCore: true, installed: true, desktopIcon: true },
        'task-manager': { name: 'Task Manager', windowId: 'task-manager-window', icon: 'task_alt', color: 'text-blue-400', isCore: true, installed: true, desktopIcon: true },
        'sticky-notes': { name: 'Sticky Notes', windowId: 'sticky-notes-window', icon: 'sticky_note_2', color: 'text-yellow-300', isCore: true, installed: true, desktopIcon: true },
        'updates': { name: 'Update Center', windowId: 'updates-window', icon: 'cloud_download', color: 'text-green-400', isCore: true, installed: true, desktopIcon: false },
        'web-browser': {
            name: 'Web Browser',
            windowId: 'web-browser-window',
            icon: 'public',
            color: 'text-blue-500',
            installed: false, // Default state
            desktopIcon: true
        },
        'media-player': {
            name: 'Media Player',
            windowId: 'media-player-window',
            icon: 'play_circle',
            color: 'text-green-500',
            installed: false, // Default state
            desktopIcon: true
        },
        'windows-defender': {
            name: 'Windows Defender',
            windowId: 'windows-defender-window',
            icon: 'security',
            color: 'text-green-500',
            installed: false, // Default state
            uninstallable: false, // This app cannot be uninstalled
            desktopIcon: true
        }
    };

    // Update Center Tabs
    const updatesTabs = document.querySelectorAll('.updates-tab');
    const updatesContents = document.querySelectorAll('.updates-content');

    // Scrollbar toggle button
    const toggleScrollbarsBtn = document.getElementById('toggle-scrollbars-btn');

    // --- Custom Message Box Functions ---
    const messageBox = document.getElementById('message-box');
    const messageBoxTitle = document.getElementById('message-box-title');
    const messageBoxContent = document.getElementById('message-box-content');
    const messageBoxOkBtn = document.getElementById('message-box-ok-btn');

    const showMessageBox = (title, message, onOk) => {
        messageBoxTitle.textContent = title;
        messageBoxContent.textContent = message;
        messageBox.classList.remove('hidden');
        messageBoxOkBtn.onclick = () => {
            messageBox.classList.add('hidden');
            if (onOk) onOk();
        };
    };
    
    const showConfirmBox = (title, message, onConfirm, onCancel) => {
        messageBoxTitle.textContent = title;
        messageBoxContent.textContent = message;
        messageBox.classList.remove('hidden');
        // Add a cancel button for confirmation
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold ml-2 transition-colors';
        messageBox.querySelector('.bg-gray-800').appendChild(cancelButton);

        messageBoxOkBtn.textContent = 'Confirm'; // Change OK to Confirm
        messageBoxOkBtn.onclick = () => {
            messageBox.classList.add('hidden');
            messageBox.querySelector('.bg-gray-800').removeChild(cancelButton); // Clean up
            if (onConfirm) onConfirm();
        };
        cancelButton.onclick = () => {
            messageBox.classList.add('hidden');
            messageBox.querySelector('.bg-gray-800').removeChild(cancelButton); // Clean up
            if (onCancel) onCancel();
        };
    };

    // --- Hashing Function (SHA-256) ---
    async function hashString(str) {
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        console.log(`[LOGIN/DB] Hashing: '${str}' -> '${hexHash}'`); // Log hashing process
        return hexHash;
    }

    // --- Account & Login ---
    const loadUsers = () => {
        const usersJson = localStorage.getItem('win13_users');
        const users = usersJson ? JSON.parse(usersJson) : {};
        console.log("[LOGIN/DB] Loaded users:", JSON.stringify(users, null, 2)); // Log loaded users with pretty print
        return users;
    };

    const saveUsers = (users) => {
        localStorage.setItem('win13_users', JSON.stringify(users));
        console.log("[LOGIN/DB] Saved users:", JSON.stringify(users, null, 2)); // Log saved users with pretty print
    };

    showCreateAccountBtn.addEventListener('click', () => { 
        loginView.classList.add('hidden'); 
        createAccountView.classList.remove('hidden'); 
        console.log("[LOGIN] Switched to Create Account view.");
    });
    showLoginBtn.addEventListener('click', () => { 
        createAccountView.classList.add('hidden'); 
        loginView.classList.remove('hidden'); 
        console.log("[LOGIN] Switched to Login view.");
    });
    
    createAccountBtn.addEventListener('click', async () => {
        const user = document.getElementById('create-username').value;
        const pass = document.getElementById('create-password').value;

        if (user && pass) { 
            let users = loadUsers();
            if (users[user]) {
                showMessageBox('Registration Failed', 'Username already exists. Please choose a different username.');
                console.warn(`[LOGIN] Registration failed: Username '${user}' already exists.`); // Log registration failure
                return;
            }
            const hashedPassword = await hashString(pass);
            users[user] = { hashedPassword: hashedPassword };
            saveUsers(users);
            showMessageBox('Account Created', 'Your account has been successfully created! You can now sign in.'); 
            console.log(`[LOGIN/DB] Account for '${user}' created successfully.`); // Log registration success
            showLoginBtn.click(); 
        } else { 
            showMessageBox('Error', 'Please enter a username and password.'); 
            console.error("[LOGIN] Registration failed: Username or password missing."); // Log missing fields
        }
    });

    signInBtn.addEventListener('click', async () => {
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;
        const users = loadUsers();

        if (users[user]) {
            const storedHashedPassword = users[user].hashedPassword;
            const enteredHashedPassword = await hashString(pass);

            if (storedHashedPassword && enteredHashedPassword === storedHashedPassword) {
                localStorage.setItem('win13_active_user', user); // Set active user
                document.getElementById('account-username').textContent = user;
                startMenuUsername.textContent = user; 
                bootSound.play().catch(e => { /* console.warn("Boot sound playback failed:", e); */ }); // Log boot sound error
                loginContainer.style.opacity = '0';
                setTimeout(() => {
                    loginContainer.classList.add('hidden');
                    desktop.style.opacity = '1';
                    // Always show disclaimer on desktop load
                    disclaimerModal.classList.remove('hidden');
                    console.log("[LOGIN] Showing disclaimer modal on desktop load.");
                }, 500);
                console.log(`[LOGIN] User '${user}' logged in successfully.`); // Log login success
            } else if (!storedHashedPassword) {
                showMessageBox('Login Failed', 'No password set for this account. Please create a new account or contact support.');
                console.warn(`[LOGIN] Login failed for '${user}': No password set for this account.`); // Log no password set
            }
            else { 
                showMessageBox('Login Failed', 'Invalid password.'); 
                console.warn(`[LOGIN] Login failed for '${user}': Invalid password.`); // Log invalid password
            }
        } else { 
            showMessageBox('Login Failed', 'Username not found. Create an account if you haven\'t.'); 
            console.warn(`[LOGIN] Login failed: Username '${user}' not found.`); // Log username not found
        }
    });

    disclaimerOkBtn.addEventListener('click', () => {
        disclaimerModal.classList.add('hidden');
        // We no longer set 'win13_disclaimer_seen' to always show it
    });

    // Initial check for active user
    if (activeUser) {
        loginContainer.classList.add('hidden');
        desktop.style.opacity = '1';
        document.getElementById('account-username').textContent = activeUser;
        startMenuUsername.textContent = activeUser;
        // Always show disclaimer on desktop load
        disclaimerModal.classList.remove('hidden');
        console.log(`[LOGIN] Active user '${activeUser}' automatically logged in. Showing disclaimer.`);
    } else {
        const users = loadUsers();
        if (Object.keys(users).length === 0) {
            loginView.classList.add('hidden');
            createAccountView.classList.remove('hidden');
            console.log("[LOGIN] No users found, showing Create Account view.");
        } else {
            console.log("[LOGIN] No active user, showing Login view.");
        }
    }


    // --- File System & Explorer ---

    // Helper to navigate VFS object
    const getObjectFromPath = (path) => {
        const parts = path.split('/').filter(p => p !== '');
        let current = vfs;
        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                return undefined;
            }
        }
        return current;
    };

    const getParentAndNameFromPath = (path) => {
        const parts = path.split('/').filter(p => p !== '');
        const name = parts.pop();
        const parentPath = parts.length > 0 ? parts.join('/') : (path.startsWith('C:') ? 'C:' : '');
        let parentObj = getObjectFromPath(parentPath);
        if (!parentObj && parentPath === 'C:') {
            parentObj = vfs['C:'];
        }
        return { parentObj, name, parentPath };
    };

    const deleteFileOrFolder = (fullPath, isDirectory) => {
        const { parentObj, name } = getParentAndNameFromPath(fullPath);
        if (!parentObj) {
            showMessageBox("Error", "Could not find parent directory.");
            return false;
        }

        if (isDirectory && Object.keys(parentObj[name]).length > 0) {
            showMessageBox("Error", `Directory '${name}' is not empty. Cannot delete.`);
            return false;
        }

        showConfirmBox(
            "Confirm Deletion",
            `Are you sure you want to delete '${name}'? This action cannot be undone.`,
            () => {
                delete parentObj[name];
                showMessageBox("Deleted", `'${name}' has been deleted.`);
                renderFileExplorer();
                recentFiles = recentFiles.filter(file => file.path !== fullPath);
                localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
                renderQuickAccess();
            }
        );
        return true;
    };

    const renameFileOrFolder = (fullPath, oldName, isDirectory) => {
        const { parentObj, parentPath } = getParentAndNameFromPath(fullPath);
        if (!parentObj) {
            showMessageBox("Error", "Could not find parent directory.");
            return false;
        }

        const newName = prompt(`Rename '${oldName}' to:`);
        if (newName && newName.trim() !== '' && newName !== oldName) {
            if (parentObj[newName] !== undefined) {
                showMessageBox("Error", `A file or folder named '${newName}' already exists.`);
                return false;
            }

            parentObj[newName] = parentObj[oldName];
            delete parentObj[oldName];

            if (!isDirectory) {
                const recentIndex = recentFiles.findIndex(file => file.path === fullPath);
                if (recentIndex !== -1) {
                    recentFiles[recentIndex].name = newName;
                    recentFiles[recentIndex].path = `${parentPath}/${newName}`;
                    localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
                    renderQuickAccess();
                }
            }
            
            showMessageBox("Renamed", `'${oldName}' renamed to '${newName}'.`);
            renderFileExplorer();
            return true;
        } else if (newName !== null) {
            showMessageBox("Info", "Rename cancelled or new name is invalid/same.");
        }
        return false;
    };


    const renderFileExplorer = () => {
        fileExplorerOutput.innerHTML = '';
        const currentDir = getObjectFromPath(currentPath);
        if (!currentDir || typeof currentDir !== 'object') {
            showMessageBox("Error", "Invalid directory path.");
            return;
        }

        const pathParts = currentPath.split('/').filter(p => p !== '');
        if (pathParts.length > 1) {
            const upIcon = document.createElement('div');
            upIcon.className = 'flex flex-col items-center p-2 rounded-lg hover:bg-white/20 cursor-pointer';
            upIcon.innerHTML = `<span class="material-symbols-outlined text-5xl text-gray-400">arrow_upward</span><span class="text-xs text-center truncate w-full">..</span>`;
            upIcon.addEventListener('click', () => {
                pathParts.pop();
                currentPath = pathParts.length > 0 ? pathParts.join('/') : 'C:';
                if (currentPath === 'C') currentPath = 'C:';
                else if (!currentPath.startsWith('C:') && pathParts.length > 0) currentPath = 'C:/' + currentPath;
                
                renderFileExplorer();
            });
            fileExplorerOutput.appendChild(upIcon);
        } else if (pathParts.length === 1 && pathParts[0] !== 'C:') {
        }

        const sortedKeys = Object.keys(currentDir).sort((a, b) => {
            const isDirA = typeof currentDir[a] === 'object';
            const isDirB = typeof currentDir[b] === 'object';
            if (isDirA && !isDirB) return -1;
            if (!isDirA && isDirB) return 1;
            return a.localeCompare(b);
        });


        sortedKeys.forEach(key => {
            const isDir = typeof currentDir[key] === 'object';
            const icon = document.createElement('div');
            icon.className = 'flex flex-col items-center p-2 rounded-lg hover:bg-white/20 cursor-pointer';
            
            let materialIcon = '';
            let iconColor = '';
            if (isDir) {
                materialIcon = 'folder';
                iconColor = 'text-yellow-500';
            } else if (key.endsWith('.txt')) {
                materialIcon = 'description';
                iconColor = 'text-gray-300';
            } else if (key.endsWith('.py')) {
                materialIcon = 'code';
                iconColor = 'text-blue-400';
            } else {
                materialIcon = 'insert_drive_file';
                iconColor = 'text-gray-500';
            }

            icon.innerHTML = `<span class="material-symbols-outlined text-5xl ${iconColor}">${materialIcon}</span><span class="text-xs text-center truncate w-full">${key}</span>`;
            
            const fullPath = `${currentPath}/${key}`;

            icon.addEventListener('click', () => {
                if (isDir) {
                    currentPath = fullPath;
                    renderFileExplorer();
                } else {
                    openFileInTextEditor(fullPath, key);
                }
            });

            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                activeFileExplorerItem = { path: fullPath, name: key, isDir: isDir };
                fileExplorerContextMenu.style.left = `${e.clientX}px`;
                fileExplorerContextMenu.style.top = `${e.clientY}px`;
                fileExplorerContextMenu.classList.remove('hidden');
            });

            fileExplorerOutput.appendChild(icon);
        });
    };

    feRenameContextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileExplorerContextMenu.classList.add('hidden');
        if (activeFileExplorerItem) {
            renameFileOrFolder(activeFileExplorerItem.path, activeFileExplorerItem.name, activeFileExplorerItem.isDir);
        }
    });

    feDeleteContextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileExplorerContextMenu.classList.add('hidden');
        if (activeFileExplorerItem) {
            deleteFileOrFolder(activeFileExplorerItem.path, activeFileExplorerItem.name, activeFileExplorerItem.isDir);
        }
    });

    document.addEventListener('click', (e) => {
        if (!desktopContextMenu.contains(e.target)) {
            desktopContextMenu.classList.add('hidden');
        }
        if (!fileExplorerContextMenu.contains(e.target)) {
            fileExplorerContextMenu.classList.add('hidden');
        }
    });


    const openFileInTextEditor = (filePath, fileName) => {
        const fileContent = getObjectFromPath(filePath);
        if (typeof fileContent === 'string') {
            textEditorTextarea.value = fileContent;
            textEditorTitle.textContent = fileName;

            if (fileName.endsWith('.py')) {
                textEditorTitle.textContent = `Code Editor - ${fileName}`;
                textEditorIcon.textContent = 'code';
                textEditorIcon.classList.remove('text-lime-400');
                textEditorIcon.classList.add('text-blue-400');
            } else if (fileName.endsWith('.txt')) {
                textEditorTitle.textContent = `Notepad - ${fileName}`;
                textEditorIcon.textContent = 'edit_note';
                textEditorIcon.classList.remove('text-blue-400');
                textEditorIcon.classList.add('text-lime-400');
            } else {
                textEditorTitle.textContent = `Text Editor - ${fileName}`;
                textEditorIcon.textContent = 'insert_drive_file';
                textEditorIcon.classList.remove('text-blue-400', 'text-lime-400');
                textEditorIcon.classList.add('text-gray-300');
            }
            
            currentOpenFile = { path: filePath, name: fileName };
            addRecentFile(filePath, fileName);
            openWindow('text-editor-window');
        } else {
            showMessageBox("Error", "Could not open file: Not a valid file or path.");
        }
    };

    saveFileBtn.addEventListener('click', () => {
        if (currentOpenFile.path) {
            const parts = currentOpenFile.path.split('/');
            const fileName = parts.pop();
            const dirPath = parts.join('/');
            const currentDir = getObjectFromPath(dirPath);

            if (currentDir && typeof currentDir === 'object') {
                currentDir[fileName] = textEditorTextarea.value;
                showMessageBox("Saved", `File '${fileName}' saved successfully!`);
                renderFileExplorer();
            } else {
                showMessageBox("Error", "Could not determine save location.");
            }
        } else {
            showMessageBox("Error", "No file is currently open to save.");
        }
    });

    newFileBtn.addEventListener('click', () => {
        const fileName = prompt("Enter file name (e.g., mydocument.txt, myscript.py):");
        if (fileName) {
            const lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith('.txt') || lowerFileName.endsWith('.py')) {
                const currentDir = getObjectFromPath(currentPath);
                if (currentDir) {
                    if (currentDir[fileName] !== undefined) {
                        showMessageBox("Error", `File '${fileName}' already exists.`);
                        return;
                    }
                    currentDir[fileName] = '';
                    renderFileExplorer();
                    showMessageBox("File Created", `File '${fileName}' created.`);
                    openFileInTextEditor(`${currentPath}/${fileName}`, fileName);
                } else {
                    showMessageBox("Error", "Could not create file: Invalid current directory.");
                }
            } else {
                showMessageBox("Invalid File Type", "Only .txt and .py files are supported for creation.");
            }
        } else {
            // User cancelled
        }
    });

    // --- Terminal ---
    const processCommand = (cmd) => {
        const [command, ...args] = cmd.trim().split(' ');
        if (!command) return;
        const append = (text) => appendTerminalOutput(text);
        switch (command.toLowerCase()) {
            case 'mkdir':
                if (!args[0]) { append("Usage: mkdir [directory_name]"); break; }
                const newDirName = args[0];
                const currentMkdirDir = getObjectFromPath(currentPath);
                if (currentMkdirDir && typeof currentMkdirDir === 'object') { 
                    if (currentMkdirDir[newDirName] !== undefined) {
                        append(`Error: Directory '${newDirName}' already exists.`);
                        break;
                    }
                    currentMkdirDir[newDirName] = {}; 
                    append(`Directory '${newDirName}' created.`); 
                    renderFileExplorer(); 
                } else { 
                    append(`Error: Path not found or not a directory.`); 
                }
                break;
            case 'ls':
                const dirToList = getObjectFromPath(currentPath);
                if (dirToList && typeof dirToList === 'object') {
                    Object.keys(dirToList).sort().forEach(item => {
                        const isDir = typeof dirToList[item] === 'object';
                        append(`${isDir ? '[DIR]' : '[FILE]'} ${item}`);
                    });
                } else {
                    append(`Error: Cannot list contents. Path not found or not a directory.`);
                }
                break;
            case 'cd':
                if (!args[0]) { append("Usage: cd [directory_name] or cd .. or cd /path/to/dir"); break; }
                let targetPath = '';
                if (args[0] === '..') {
                    const pathParts = currentPath.split('/').filter(p => p !== '');
                    if (pathParts.length > 1) {
                        pathParts.pop();
                        targetPath = pathParts.join('/');
                        if (!targetPath.startsWith('C:') && pathParts.length > 0) targetPath = 'C:/' + targetPath;
                        if (pathParts.length === 0) targetPath = 'C:';
                    } else {
                        append("Already at root.");
                        break;
                    }
                } else if (args[0].startsWith('/')) {
                    targetPath = args[0].substring(1);
                    if (!targetPath.startsWith('C:') && targetPath !== 'C:') {
                        targetPath = 'C:/' + targetPath;
                    }
                } else {
                    targetPath = `${currentPath}/${args[0]}`;
                }

                targetPath = targetPath.replace(/\/\/+/g, '/');
                if (targetPath === 'C') targetPath = 'C:';
                else if (targetPath.endsWith(':') && targetPath.length > 1) { /* do nothing */ }
                else if (targetPath.includes(':') && !targetPath.includes('/')) { /* do nothing */ }
                else if (!targetPath.startsWith('C:/') && !targetPath.endsWith(':')) {
                    targetPath = 'C:/' + targetPath;
                }


                const newDir = getObjectFromPath(targetPath);
                if (newDir && typeof newDir === 'object') {
                    currentPath = targetPath;
                    append(`Changed directory to ${currentPath}`);
                    renderFileExplorer();
                } else {
                    append(`Error: Directory '${args[0]}' not found or is a file.`);
                }
                break;
            case 'cat':
                if (!args[0]) { append("Usage: cat [file_name]"); break; }
                const filePath = `${currentPath}/${args[0]}`;
                const fileContent = getObjectFromPath(filePath);
                if (typeof fileContent === 'string') {
                    append(`--- Content of ${args[0]} ---`);
                    append(fileContent);
                    append(`--- End of file ---`);
                } else {
                    append(`Error: File '${args[0]}' not found or is a directory.`);
                }
                break;
            case 'touch':
                if (!args[0]) { append("Usage: touch [file_name]"); break; }
                const currentTouchDir = getObjectFromPath(currentPath);
                const touchFileName = args[0];
                if (currentTouchDir && typeof currentTouchDir === 'object') {
                    if (currentTouchDir[touchFileName] !== undefined) {
                        append(`Error: File '${touchFileName}' already exists.`);
                        break;
                    }
                    currentTouchDir[touchFileName] = '';
                    append(`File '${touchFileName}' created.`);
                    renderFileExplorer();
                } else {
                    append(`Error: Path not found.`);
                }
                break;
            case 'rm':
                if (!args[0]) { append("Usage: rm [file_or_dir_name] or rm -r [directory_name]"); break; }
                const rmOptions = args[0];
                const rmTarget = args[1] || args[0];
                const currentRmDir = getObjectFromPath(currentPath);
                
                if (!currentRmDir || typeof currentRmDir !== 'object') {
                    append(`Error: Current path not found or not a directory.`);
                    break;
                }

                if (rmOptions === '-r') {
                    const targetPath = `${currentPath}/${rmTarget}`;
                    const targetObj = getObjectFromPath(targetPath);

                    if (!targetObj) {
                        append(`Error: '${rmTarget}' not found.`);
                        break;
                    }

                    if (typeof targetObj === 'object') {
                        showConfirmBox(
                            "Confirm Recursive Deletion",
                            `Are you sure you want to recursively delete directory '${rmTarget}' and all its contents? This cannot be undone.`,
                            () => {
                                const deleteRecursive = (obj, nameToDelete) => {
                                    if (obj[nameToDelete]) {
                                        delete obj[nameToDelete];
                                    }
                                };
                                deleteRecursive(currentRmDir, rmTarget);
                                append(`Recursively removed '${rmTarget}'.`);
                                renderFileExplorer();
                            }
                        );
                    } else {
                        showConfirmBox(
                            "Confirm Deletion",
                            `Are you sure you want to delete file '${rmTarget}'? This cannot be undone.`,
                            () => {
                                delete currentRmDir[rmTarget];
                                append(`Removed '${rmTarget}'.`);
                                renderFileExplorer();
                                recentFiles = recentFiles.filter(file => file.path !== targetPath);
                                localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
                                renderQuickAccess();
                            }
                        );
                    }
                } else {
                    if (currentRmDir[rmTarget] !== undefined) {
                        if (typeof currentRmDir[rmTarget] === 'object' && Object.keys(currentRmDir[rmTarget]).length > 0) {
                            append(`Error: Directory '${rmTarget}' is not empty. Use 'rm -r ${rmTarget}' to remove recursively.`);
                        } else {
                            showConfirmBox(
                                "Confirm Deletion",
                                `Are you sure you want to delete '${rmTarget}'? This cannot be undone.`,
                                () => {
                                    delete currentRmDir[rmTarget];
                                    append(`Removed '${rmTarget}'.`);
                                    renderFileExplorer();
                                    const targetPath = `${currentPath}/${rmTarget}`;
                                    recentFiles = recentFiles.filter(file => file.path !== targetPath);
                                    localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
                                    renderQuickAccess();
                                }
                            );
                        }
                    } else {
                        append(`Error: '${rmTarget}' not found.`);
                    }
                }
                break;
            case 'rmdir':
                if (!args[0]) { append("Usage: rmdir [directory_name]"); break; }
                const rmdirTarget = args[0];
                const currentRmdirDir = getObjectFromPath(currentPath);

                if (!currentRmdirDir || typeof currentRmdirDir !== 'object' || currentRmdirDir[rmdirTarget] === undefined) {
                    append(`Error: Directory '${rmdirTarget}' not found.`);
                    break;
                }
                if (typeof currentRmdirDir[rmdirTarget] !== 'object') {
                    append(`Error: '${rmdirTarget}' is a file, not a directory.`);
                    break;
                }
                if (Object.keys(currentRmdirDir[rmdirTarget]).length > 0) {
                    append(`Error: Directory '${rmdirTarget}' is not empty. Use 'rm -r ${rmdirTarget}' to remove recursively.`);
                    break;
                }

                showConfirmBox(
                    "Confirm Directory Deletion",
                    `Are you sure you want to delete empty directory '${rmdirTarget}'?`,
                    () => {
                        delete currentRmdirDir[rmdirTarget];
                        append(`Removed directory '${rmdirTarget}'.`);
                        renderFileExplorer();
                    }
                );
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                break;
            case 'ps':
                append("PID | Window Title");
                append("------------------");
                document.querySelectorAll('.window:not(.hidden)').forEach((win, index) => {
                    const titleBar = win.querySelector('.title-bar > div > span:last-child');
                    const title = titleBar ? titleBar.textContent : 'Unnamed Window';
                    append(`${String(index + 1).padStart(3, '0')} | ${title} (ID: ${win.id})`);
                });
                break;
            case 'kill':
                if (!args[0]) { append("Usage: kill [window_id]"); break; }
                const windowToKill = document.getElementById(args[0]);
                if (windowToKill && !windowToKill.classList.contains('hidden')) {
                    windowToKill.classList.add('hidden');
                    append(`Window '${args[0]}' killed.`);
                } else {
                    append(`Error: Window '${args[0]}' not found or already closed.`);
                }
                break;
            case 'man':
                if (!args[0]) { append("Usage: man [command]"); break; }
                const manPage = {
                    'mkdir': 'mkdir [name] - Creates a new directory.',
                    'ls': 'ls - Lists contents of the current directory.',
                    'cd': 'cd [path] - Changes the current directory. Use ".." for parent, "/" for root.',
                    'cat': 'cat [file] - Displays the content of a text file.',
                    'touch': 'touch [file] - Creates an empty file.',
                    'rm': 'rm [file_or_dir] - Removes a file or an empty directory. Use "rm -r [dir]" for recursive deletion.',
                    'rmdir': 'rmdir [dir] - Removes an empty directory.',
                    'clear': 'clear - Clears the terminal screen.',
                    'ps': 'ps - Lists currently running windows (processes) and their IDs.',
                    'kill': 'kill [window_id] - Closes the specified window.',
                    'echo': 'echo [text] - Displays the provided text.',
                    'pwd': 'pwd - Prints the current working directory.',
                    'whoami': 'whoami - Displays the current logged-in username.',
                    'date': 'date - Displays the current date and time.',
                    'help': 'help - Displays a list of available commands.',
                    'restart': 'restart - Reloads the operating system concept.'
                };
                if (manPage[args[0].toLowerCase()]) {
                    append(manPage[args[0].toLowerCase()]);
                } else {
                    append(`No manual entry for '${args[0]}'.`);
                }
                break;
            case 'echo':
                append(args.join(' '));
                break;
            case 'pwd':
                append(currentPath);
                break;
            case 'whoami':
                append(activeUser || 'Guest');
                break;
            case 'date':
                append(new Date().toLocaleString());
                break;
            case 'history':
                append("Command history not implemented yet.");
                break;
            case 'restart':
                showConfirmBox("Restart System", "Are you sure you want to restart the system?", () => {
                    window.location.reload();
                });
                break;
            default: append(`'${command}' is not recognized.`);
        }
    };
    const createPrompt = () => {
        const promptContainer = document.createElement('div');
        promptContainer.className = 'flex';
        promptContainer.innerHTML = `<span class="text-green-400">${currentPath}>&nbsp;</span><input type="text" id="terminal-input" class="flex-grow bg-transparent border-none outline-none font-mono text-white">`;
        terminalOutput.appendChild(promptContainer);
        const input = document.getElementById('terminal-input');
        input.focus();
        input.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleTerminalInput(e); });
    };
    const appendTerminalOutput = (text) => { terminalOutput.innerHTML += `<div>${text.replace(/\n/g, '<br>')}</div>`; terminalOutput.scrollTop = terminalOutput.scrollHeight; };
    
    // --- Window Management (Drag & Resize) ---
    let activeWindow = null, action = null, startX, startY, startW, startH;
    let highestZIndex = 45; // Starting Z-index for active windows

    const updateWindowsZIndex = () => {
        document.querySelectorAll('.window').forEach(w => {
            if (parseInt(w.style.zIndex) > 40) { // Keep higher z-index for active ones
                w.style.zIndex = '40';
            }
        });
        document.querySelectorAll('.sticky-note').forEach(n => {
             if (parseInt(n.style.zIndex) > 40) {
                 n.style.zIndex = '40';
             }
        });
        if (activeWindow) {
            activeWindow.style.zIndex = String(++highestZIndex);
        }
    };

    const startAction = (e, windowEl, currentAction) => {
        action = currentAction;
        activeWindow = windowEl;
        updateWindowsZIndex(); // Bring active window to front

        const event = e.type === 'touchstart' ? e.touches[0] : e;
        startX = event.clientX; startY = event.clientY;
        // Store initial position for dragging, initial dimensions for resizing
        activeWindow.dataset.initialLeft = activeWindow.offsetLeft;
        activeWindow.dataset.initialTop = activeWindow.offsetTop;
        startW = parseInt(document.defaultView.getComputedStyle(activeWindow).width, 10);
        startH = parseInt(document.defaultView.getComputedStyle(activeWindow).height, 10);
        
        // Add global event listeners for dragging/resizing
        document.addEventListener('mousemove', doAction);
        document.addEventListener('mouseup', endAction);
        document.addEventListener('touchmove', doAction, { passive: false });
        document.addEventListener('touchend', endAction);
    };

    const doAction = (e) => {
        if (!activeWindow) return;
        e.preventDefault(); // Prevent scrolling on touch devices during drag/resize
        const event = e.type === 'touchmove' ? e.touches[0] : e;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (action === 'drag') {
            const initialLeft = parseInt(activeWindow.dataset.initialLeft, 10);
            const initialTop = parseInt(activeWindow.dataset.initialTop, 10);
            activeWindow.style.left = `${initialLeft + dx}px`;
            activeWindow.style.top = `${initialTop + dy}px`;
        } else if (action === 'resize') {
            activeWindow.style.width = `${Math.max(activeWindow.minWidth || 200, startW + dx)}px`; // Ensure minWidth
            activeWindow.style.height = `${Math.max(activeWindow.minHeight || 150, startH + dy)}px`; // Ensure minHeight
        }
    };

    const endAction = () => {
        activeWindow = null;
        action = null;
        // Remove global event listeners
        document.removeEventListener('mousemove', doAction);
        document.removeEventListener('mouseup', endAction);
        document.removeEventListener('touchmove', doAction);
        document.removeEventListener('touchend', endAction);
    };

    // Attach event listeners to all draggable/resizable elements
    document.querySelectorAll('.window').forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        const resizeHandle = win.querySelector('.resize-handle');
        if (titleBar) {
            titleBar.addEventListener('mousedown', e => startAction(e, win, 'drag'));
            titleBar.addEventListener('touchstart', e => startAction(e, win, 'drag'));
        }
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', e => startAction(e, win, 'resize'));
            resizeHandle.addEventListener('touchstart', e => startAction(e, win, 'resize'));
        }
        // Add click listener to bring to front
        win.addEventListener('mousedown', () => {
            activeWindow = win;
            updateWindowsZIndex();
        });
        win.addEventListener('touchstart', () => {
            activeWindow = win;
            updateWindowsZIndex();
        });
    });

    const openWindow = (windowId, initialContentId = null) => {
        const windowEl = document.getElementById(windowId);
        if(windowEl) {
            windowEl.classList.remove('hidden');
            // Center the window if it's new or just opened
            if (!windowEl.dataset.positioned) {
                windowEl.style.left = `${(window.innerWidth - windowEl.offsetWidth) / 2}px`;
                windowEl.style.top = `${(window.innerHeight - windowEl.offsetHeight) / 2}px`;
                windowEl.dataset.positioned = 'true';
            }
            activeWindow = windowEl; // Set as active window
            updateWindowsZIndex(); // Bring to front
        }
        if(windowId === 'terminal-window' && !terminalOutput.hasChildNodes()) createPrompt();
        if(windowId === 'file-explorer-window') renderFileExplorer();
        if(windowId === 'settings-window' && initialContentId) {
            settingsTabs.forEach(tab => tab.classList.remove('bg-white/20', 'dark:bg-black/20'));
            settingsContents.forEach(content => content.classList.add('hidden'));
            const targetTab = document.querySelector(`.settings-tab[data-content-id="${initialContentId}"]`);
            const targetContent = document.getElementById(initialContentId);
            if(targetTab) targetTab.classList.add('bg-white/20', 'dark:bg-black/20');
            if(targetContent) targetContent.classList.remove('hidden');
        } else if (windowId === 'updates-window') {
            updatesTabs.forEach(tab => tab.classList.remove('bg-white/20', 'dark:bg-black/20'));
            updatesContents.forEach(content => content.classList.add('hidden'));
            const defaultUpdatesTab = document.querySelector('.updates-tab[data-content-id="updates-list-content"]');
            const defaultUpdatesContent = document.getElementById('updates-list-content');
            if (defaultUpdatesTab) defaultUpdatesTab.classList.add('bg-white/20', 'dark:bg-black/20');
            if (defaultUpdatesContent) defaultUpdatesContent.classList.remove('hidden');
        }
        if (windowId === 'updater-hub-window') {
            renderUpdaterHub();
        }
        if (windowId === 'start-menu') {
            renderQuickAccess();
        }
        if (windowId === 'task-manager-window') {
            renderProcessList();
        }
        if (windowId === 'calendar-window') {
            renderCalendar();
        }
    };

    document.querySelectorAll('[data-window]').forEach(btn => btn.addEventListener('click', e => { 
        e.stopPropagation(); 
        openWindow(btn.getAttribute('data-window')); 
    }));
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', e => { 
        e.stopPropagation(); 
        const windowId = btn.getAttribute('data-window');
        document.getElementById(windowId).classList.add('hidden'); 
        activeWindow = null; // Clear active window when closed
    }));

    // --- CPU and Memory Simulation ---

    class Memory {
        constructor(size) {
            this.buffer = new ArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT);
            this.data = new Float64Array(this.buffer);
            this.size = size;
            this.allocatedPointer = 0;
        }

        read(address) {
            if (address < 0 || address >= this.size) {
                return NaN;
            }
            const value = this.data[address];
            return value;
        }

        write(address, value) {
            if (address < 0 || address >= this.size) {
                return;
            }
            this.data[address] = value;
        }

        allocate(size = 1) {
            if (this.allocatedPointer + size > this.size) {
                return -1;
            }
            const address = this.allocatedPointer;
            for(let i = 0; i < size; i++) {
                this.data[address + i] = 0;
            }
            this.allocatedPointer += size;
            return address;
        }

        reset() {
            this.data.fill(0);
            this.allocatedPointer = 0;
        }
    }

    class CPU {
        constructor(memory) {
            this.memory = memory;
            this.registers = {
                PC: 0,
                ACC: 0,
                R1: 0,
                R2: 0
            };
            this.isRunning = false;
            this.program = [];
            this.programStartAddr = 0;
            this.speed = 100;
        }

        static Instructions = {
            LOAD: 0x01, STORE: 0x02, ADD: 0x03, SUB: 0x04, JUMP: 0x05, JUMPIFZERO: 0x06, SET: 0x07, HALT: 0xFF
        };

        reset() {
            this.registers.PC = 0;
            this.registers.ACC = 0;
            this.registers.R1 = 0;
            this.registers.R2 = 0;
            this.program = [];
            this.programStartAddr = 0;
            this.isRunning = false;
            this.memory.reset();
        }

        loadProgram(program) {
            this.reset();
            this.program = program;
            let currentAddress = this.memory.allocate(program.length);
            if (currentAddress === -1) {
                showMessageBox("Error", "Failed to allocate memory for program. Memory full?");
                return;
            }
            for (let i = 0; i < program.length; i++) {
                this.memory.write(currentAddress + i, program[i]);
            }
            this.programStartAddr = currentAddress;
            this.registers.PC = currentAddress;
        }

        step() {
            if (this.registers.PC < 0 || this.registers.PC >= this.memory.size) {
                this.isRunning = false;
                return;
            }
            if (this.program.length > 0 && 
                (this.registers.PC < this.programStartAddr || this.registers.PC >= this.programStartAddr + this.program.length)) {
                this.isRunning = false;
                return;
            }

            const instruction = this.memory.read(this.registers.PC);
            this.registers.PC++;

            switch (instruction) {
                case CPU.Instructions.LOAD:
                    const loadAddress = this.memory.read(this.registers.PC++);
                    this.registers.ACC = this.memory.read(loadAddress);
                    break;
                case CPU.Instructions.STORE:
                    const storeAddress = this.memory.read(this.registers.PC++);
                    this.memory.write(storeAddress, this.registers.ACC);
                    break;
                case CPU.Instructions.ADD:
                    const addAddress = this.memory.read(this.registers.PC++);
                    this.registers.ACC += this.memory.read(addAddress);
                    break;
                case CPU.Instructions.SUB:
                    const subAddress = this.memory.read(this.registers.PC++);
                    this.registers.ACC -= this.memory.read(subAddress);
                    break;
                case CPU.Instructions.JUMP:
                    const jumpAddress = this.memory.read(this.registers.PC++);
                    this.registers.PC = jumpAddress;
                    break;
                case CPU.Instructions.JUMPIFZERO:
                    const jumpIfZeroAddress = this.memory.read(this.registers.PC++);
                    if (this.registers.ACC === 0) {
                        this.registers.PC = jumpIfZeroAddress;
                    } else {
                        //
                    }
                    break;
                case CPU.Instructions.SET:
                    const registerCode = this.memory.read(this.registers.PC++);
                    const value = this.memory.read(this.registers.PC++);
                    if (registerCode === 0) this.registers.ACC = value;
                    else if (registerCode === 1) this.registers.R1 = value;
                    else if (registerCode === 2) this.registers.R2 = value;
                    break;
                case CPU.Instructions.HALT:
                    this.isRunning = false;
                    break;
                default:
                    this.isRunning = false;
                    break;
            }
            updateCPUMonitorUI();
        }

        async execute() {
            this.isRunning = true;
            while (this.isRunning) {
                this.step();
                if (!this.isRunning) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, this.speed));
            }
            showMessageBox("Program Finished", "CPU program execution has completed.");
        }
    }

    // Initialize Memory and CPU
    const memory = new Memory(256);
    const cpu = new CPU(memory);

    // --- UI Update Functions for CPU Monitor ---
    const updateCPURegistersUI = () => {
        cpuRegistersDisplay.innerHTML = '';
        for (const reg in cpu.registers) {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-700/50 p-2 rounded-md';
            div.innerHTML = `<span class="font-semibold text-white">${reg}:</span><span class="font-mono text-right text-green-300">${cpu.registers[reg]}</span>`;
            cpuRegistersDisplay.appendChild(div);
        }
    };

    const updateMemoryDisplayUI = () => {
        memoryDisplay.innerHTML = '';
        const cellsPerRow = 8;
        for (let i = 0; i < memory.size; i += cellsPerRow) {
            const row = document.createElement('div');
            row.className = 'flex w-full mb-1';
            
            const addressLabel = document.createElement('span');
            addressLabel.className = 'w-1/8 text-gray-400 mr-2 min-w-[50px] text-right';
            addressLabel.textContent = `0x${i.toString(16).padStart(3, '0')}:`;
            row.appendChild(addressLabel);

            for (let j = 0; j < cellsPerRow; j++) {
                const address = i + j;
                const cell = document.createElement('span');
                const isProgramInstruction = (address >= cpu.programStartAddr && address < cpu.programStartAddr + cpu.program.length);
                const isCurrentPC = cpu.registers.PC === address && cpu.isRunning;

                cell.className = `flex-1 p-1 rounded-sm text-center 
                                  ${isCurrentPC ? 'bg-purple-600 text-white font-bold' : 
                                   (isProgramInstruction ? 'bg-indigo-700/50 text-blue-200' : 'bg-gray-700/50')}`;
                const value = memory.read(address);
                cell.textContent = isNaN(value) ? '--' : value.toFixed(0);
                row.appendChild(cell);
            }
            memoryDisplay.appendChild(row);
        }
    };


    const updateCPUMonitorUI = () => {
        updateCPURegistersUI();
        updateMemoryDisplayUI();
    };

    // --- CPU Monitor Event Listeners ---
    loadProgramBtn.addEventListener('click', () => {
        try {
            const programText = programEditor.value.trim();
            const programLines = programText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            const parsedProgram = [];
            programLines.forEach(line => {
                const parts = line.split(';');
                const instructionPart = parts[0].trim();
                if (instructionPart === '') return;

                const instructionWords = instructionPart.split(/\s+/);
                const instructionName = instructionWords[0].toUpperCase();
                
                if (CPU.Instructions[instructionName] !== undefined) {
                    parsedProgram.push(CPU.Instructions[instructionName]);
                    for (let i = 1; i < instructionWords.length; i++) {
                        const arg = parseInt(instructionWords[i], 10);
                        if (!isNaN(arg)) {
                            parsedProgram.push(arg);
                        } else {
                            //
                        }
                    }
                } else if (!isNaN(parseInt(instructionPart, 10))) {
                    parsedProgram.push(parseInt(instructionPart, 10));
                } else {
                    showMessageBox("Program Load Warning", `Unknown instruction or invalid data: "${instructionPart}".`);
                }
            });

            cpu.loadProgram(parsedProgram);
            updateCPUMonitorUI();
            showMessageBox("Program Loaded", "Program loaded successfully! PC set to start.");
        } catch (error) {
            showMessageBox("Error", "Failed to load program. Check console for details.");
        }
    });

    runProgramBtn.addEventListener('click', () => {
        if (!cpu.isRunning) {
            cpu.execute();
        } else {
            showMessageBox("CPU Busy", "CPU is already running. Please wait for it to finish or reset.");
        }
    });

    stepProgramBtn.addEventListener('click', () => {
        if (!cpu.isRunning) {
            cpu.step();
        } else {
            showMessageBox("CPU Busy", "CPU is already running. Stop it before stepping.");
        }
    });

    resetCpuBtn.addEventListener('click', () => {
        cpu.reset();
        updateCPUMonitorUI();
        showMessageBox("CPU Reset", "CPU and Memory have been reset.");
    });

    const cpuMonitorWindow = document.getElementById('cpu-monitor-window');
    if (cpuMonitorWindow) {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (!cpuMonitorWindow.classList.contains('hidden')) {
                        updateCPUMonitorUI();
                    }
                }
            }
        });
        observer.observe(cpuMonitorWindow, { attributes: true });
    }

    programEditor.value = `SET 0 10   ; Set ACC to 10
STORE 20   ; Store ACC (10) at memory address 20
SET 0 5    ; Set ACC to 5
STORE 21   ; Store ACC (5) at memory address 21
LOAD 20    ; Load value from address 20 (10) into ACC
ADD 21     ; Add value from address 21 (5) to ACC (ACC becomes 15)
STORE 22   ; Store ACC (15) at memory address 22
HALT       ; End program
`;

    updateCPUMonitorUI();

    // --- Desktop Clock ---
    const updateClock = () => {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        
        // Update time and date displays separately - removed font-orbitron/font-poppins classes
        timeDisplayElement.textContent = timeString;
        dateDisplayElement.textContent = dateString;

        // Update year display
        const fullYear = now.getFullYear();
        const shortenedYear = String(fullYear).substring(0, 2); // Get first two digits for "20" or "12"
        yearDisplayElement.textContent = shortenedYear;
        yearDisplayElement.dataset.fullYear = fullYear; // Store full year for toggling
    };
    setInterval(updateClock, 1000);
    updateClock();

    // The clock is now in the taskbar, and clicking it should open calendar
    document.getElementById('clock-container').addEventListener('click', () => {
        openWindow('calendar-window'); // Open calendar window instead of settings
    });

    // Event listener for year display to toggle full year
    yearDisplayElement.addEventListener('click', () => {
        const currentText = yearDisplayElement.textContent;
        const fullYear = yearDisplayElement.dataset.fullYear;
        const shortenedYear = String(fullYear).substring(0, 2);

        if (currentText === shortenedYear) {
            yearDisplayElement.textContent = fullYear;
        } else {
            yearDisplayElement.textContent = fullYear;
        }
    });


    // --- Desktop Context Menu ---
    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        desktopContextMenu.style.left = `${e.clientX}px`;
        desktopContextMenu.style.top = `${e.clientY}px`;
        desktopContextMenu.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!desktopContextMenu.contains(e.target)) {
            desktopContextMenu.classList.add('hidden');
        }
        if (!fileExplorerContextMenu.contains(e.target)) {
            fileExplorerContextMenu.classList.add('hidden');
        }
    });

    openSettingsContextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openWindow('settings-window', 'background-content');
        desktopContextMenu.classList.add('hidden');
    });

    toggleDesktopIconsContextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showDesktopIcons = !showDesktopIcons;
        localStorage.setItem('showDesktopIcons', showDesktopIcons);
        renderDesktopIcons();
        desktopContextMenu.classList.add('hidden');
        showMessageBox("Desktop Icons", `Desktop icons are now ${showDesktopIcons ? 'shown' : 'hidden'}.`);
    });

    // --- Settings Window Logic ---
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            settingsTabs.forEach(t => t.classList.remove('bg-white/20', 'dark:bg-black/20'));
            settingsContents.forEach(c => c.classList.add('hidden'));

            tab.classList.add('bg-white/20', 'dark:bg-black/20');
            const targetContentId = tab.getAttribute('data-content-id');
            const targetContent = document.getElementById(targetContentId);
            if(targetContent) targetContent.classList.remove('hidden');
        });
    });

    setLightBgBtn.addEventListener('click', () => {
        applyTheme('light');
    });
    setDarkBgBtn.addEventListener('click', () => {
        applyTheme('dark');
    });

    bgColorPicker.addEventListener('input', (e) => {
        desktop.style.backgroundImage = 'none';
        desktop.style.backgroundColor = e.target.value;
        localStorage.setItem('customBgColor', e.target.value);
        localStorage.removeItem('theme');
    });

    const applyTheme = (theme) => {
        desktop.style.backgroundColor = '';
        localStorage.removeItem('customBgColor');
        if (theme === 'dark') {
            document.body.classList.add('dark');
            desktop.classList.remove('desktop-light');
            desktop.classList.add('desktop-dark');
        } else {
            document.body.classList.remove('dark');
            desktop.classList.remove('desktop-dark');
            desktop.classList.add('desktop-light');
        }
        localStorage.setItem('theme', theme);
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedCustomColor = localStorage.getItem('customBgColor');

    if (savedCustomColor) {
        desktop.style.backgroundImage = 'none';
        desktop.style.backgroundColor = savedCustomColor;
        bgColorPicker.value = savedCustomColor;
        document.body.classList.remove('dark');
    } else {
        applyTheme(savedTheme);
    }

    // --- Quick Access Functions ---
    const MAX_RECENT_FILES = 5;

    const addRecentFile = (filePath, fileName) => {
        const existingIndex = recentFiles.findIndex(file => file.path === filePath);

        if (existingIndex !== -1) {
            recentFiles.splice(existingIndex, 1);
        }

        recentFiles.unshift({ path: filePath, name: fileName });

        if (recentFiles.length > MAX_RECENT_FILES) {
            recentFiles = recentFiles.slice(0, MAX_RECENT_FILES);
        }

        localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
        renderQuickAccess();
    };

    const renderQuickAccess = () => {
        quickAccessContent.innerHTML = '';

        if (recentFiles.length === 0) {
            quickAccessContent.innerHTML = '<p class="text-sm text-gray-400">No recent files.</p>';
            return;
        }

        recentFiles.forEach(file => {
            const fileElement = document.createElement('a');
            fileElement.href = "#";
            fileElement.className = "flex items-center space-x-2 p-2 rounded-lg hover:bg-white/30 dark:hover:bg-black/30 transition-colors";
            
            let materialIcon = '';
            let iconColor = '';
            if (file.name.endsWith('.txt')) {
                materialIcon = 'description';
                iconColor = 'text-gray-300';
            } else if (file.name.endsWith('.py')) {
                materialIcon = 'code';
                iconColor = 'text-blue-400';
            } else {
                materialIcon = 'insert_drive_file';
                iconColor = 'text-gray-500';
            }

            fileElement.innerHTML = `<span class="material-symbols-outlined ${iconColor}">${materialIcon}</span><span>${file.name}</span>`;
            
            fileElement.addEventListener('click', (e) => {
                e.preventDefault();
                openFileInTextEditor(file.path, file.name);
                startMenu.classList.add('hidden');
            });
            quickAccessContent.appendChild(fileElement);
        });
    };

    startMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
        if (!startMenu.classList.contains('hidden')) {
            renderQuickAccess();
            startMenuUsername.textContent = activeUser || 'Guest';
            renderInstallableApps(); // Update installable apps in start menu
        } else {
            //
        }
    });

    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && !startMenuBtn.contains(e.target) && !powerOptionsMenu.contains(e.target)) {
            if (!startMenu.classList.contains('hidden')) {
                startMenu.classList.add('hidden');
                powerOptionsMenu.classList.add('hidden');
            }
        }
    });

    powerOptionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        powerOptionsMenu.classList.toggle('hidden');
    });

    signOutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showConfirmBox("Sign Out", "Are you sure you want to sign out? This will clear your password for this session and return you to the login screen.", () => {
            if (activeUser) {
                let users = loadUsers();
                if (users[activeUser]) {
                    users[activeUser].hashedPassword = "";
                    saveUsers(users);
                    console.log(`[LOGIN/DB] Password for '${activeUser}' cleared upon sign out.`);
                }
                localStorage.removeItem('win13_active_user');
            }
            window.location.reload();
        });
    });

    restartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showConfirmBox("Restart System", "Are you sure you want to restart the system?", () => {
            window.location.reload();
        });
    });

    // New: Shutdown functionality
    shutdownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showConfirmBox("Shut Down System", "Are you sure you want to shut down the system?", () => {
            // Hide all windows
            document.querySelectorAll('.window').forEach(win => win.classList.add('hidden'));
            document.querySelectorAll('.sticky-note').forEach(note => note.classList.add('hidden'));
            desktopIconsContainer.classList.add('hidden');
            document.getElementById('dock').classList.add('hidden'); // Assuming the dock element has id="dock" or similar if needed

            // Show power-off screen
            powerOffScreen.classList.remove('hidden');
            powerOffScreen.classList.add('active'); // Start fade in effect

            // Simulate shutdown process
            powerOffMessage.textContent = "Shutting down...";
            setTimeout(() => {
                powerOffMessage.textContent = "Saving user data...";
            }, 1500);
            setTimeout(() => {
                powerOffMessage.textContent = "Powering off...";
            }, 3000);
            setTimeout(() => {
                powerOffScreen.classList.add('fade-out'); // Start fade out effect
                setTimeout(() => {
                    powerOffScreen.classList.add('hidden'); // Fully hide after fade out
                    // Optionally, redirect or show a blank screen/login
                    // For now, we'll just leave it black and inactive.
                    document.body.innerHTML = '<div class="absolute inset-0 bg-black flex items-center justify-center text-white text-3xl font-bold">System Off</div>';
                }, 1000); // Wait for fade-out transition
            }, 4000); // Total duration before full power off
        });
    });


    renderQuickAccess();

    const toggleScrollbars = () => {
        const prefersNoScrollbars = document.body.classList.toggle('hide-scrollbars');
        localStorage.setItem('hideScrollbars', prefersNoScrollbars);
    };

    toggleScrollbarsBtn.addEventListener('click', toggleScrollbars);

    if (localStorage.getItem('hideScrollbars') === 'true') {
        document.body.classList.add('hide-scrollbars');
    } else {
        //
    }

    // --- Calculator Logic ---
    function updateCalculatorDisplay() {
        calculatorDisplay.textContent = currentInput;
    }

    function resetCalculator() {
        currentInput = '0';
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
        updateCalculatorDisplay();
    }

    function handleDigitClick(digit) {
        if (currentInput.length >= 12 && !waitingForSecondOperand) {
            showMessageBox("Input Limit", "Display limit reached (12 digits).");
            return;
        }
        if (waitingForSecondOperand) {
            currentInput = digit;
            waitingForSecondOperand = false;
        } else {
            currentInput = currentInput === '0' ? digit : currentInput + digit;
        }
        updateCalculatorDisplay();
    }

    function handleDecimalClick() {
        if (waitingForSecondOperand) {
            currentInput = '0.';
            waitingForSecondOperand = false;
            updateCalculatorDisplay();
            return;
        }
        if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateCalculatorDisplay();
    }

    function handleOperatorClick(nextOperator) {
        const inputValue = parseFloat(currentInput);

        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }

        if (firstOperand === null) {
            firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation[operator](firstOperand, inputValue);
            currentInput = String(result);
            firstOperand = result;
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
        updateCalculatorDisplay();
    }

    const performCalculation = {
        '/': (firstOperand, secondOperand) => {
            if (firstOperand === 0 && secondOperand === 0) {
                return 0.10; // Special case for 0/0
            }
            return secondOperand === 0 ? NaN : firstOperand / secondOperand;
        },
        '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
        '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
        '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
        '=': (firstOperand, secondOperand) => secondOperand // For equals, just return the second operand if no previous operator, otherwise handled by handleOperatorClick
    };

    calculatorKeypad.addEventListener('click', (event) => {
        const { target } = event;
        if (!target.matches('button')) {
            return;
        }

        if (target.classList.contains('operator')) {
            if (target.textContent === '←') { // Backspace
                currentInput = currentInput.slice(0, -1);
                if (currentInput === '') {
                    currentInput = '0';
                }
                updateCalculatorDisplay();
                return;
            }
            handleOperatorClick(target.textContent);
            return;
        }

        if (target.classList.contains('equals')) {
            if (firstOperand !== null && operator) {
                handleOperatorClick('='); // Trigger final calculation
                operator = null; // Clear operator after calculation
                waitingForSecondOperand = false;
            }
            return;
        }

        if (target.classList.contains('clear')) {
            resetCalculator();
            return;
        }

        if (target.textContent === '.') {
            handleDecimalClick();
            return;
        }

        handleDigitClick(target.textContent);
    });

    resetCalculator(); // Initialize calculator display on load

    // --- Task Manager Logic ---
    const renderProcessList = () => {
        processListDiv.innerHTML = ''; // Clear existing list
        selectedProcessId = null; // Reset selection

        const runningWindows = document.querySelectorAll('.window:not(.hidden)');
        if (runningWindows.length === 0) {
            processListDiv.innerHTML = '<p class="text-gray-400">No applications running.</p>';
            return;
        }

        runningWindows.forEach(win => {
            const titleBar = win.querySelector('.title-bar > div > span:last-child');
            const title = titleBar ? titleBar.textContent : 'Unnamed Window';
            const processId = win.id;

            const processItem = document.createElement('div');
            processItem.className = 'process-item';
            processItem.setAttribute('data-process-id', processId);
            processItem.innerHTML = `
                <span>${title}</span>
                <span class="text-xs text-gray-400">${processId}</span>
            `;

            processItem.addEventListener('click', () => {
                // Remove highlight from previously selected item
                document.querySelectorAll('#process-list > .process-item').forEach(item => {
                    item.classList.remove('selected');
                });
                // Add highlight to current item
                processItem.classList.add('selected');
                selectedProcessId = processId;
            });
            processListDiv.appendChild(processItem);
        });
    };

    refreshProcessesBtn.addEventListener('click', renderProcessList);

    endTaskBtn.addEventListener('click', () => {
        if (selectedProcessId) {
            showConfirmBox("End Task", `Are you sure you want to end the task for '${selectedProcessId}'? This may cause unsaved data loss.`, () => {
                const windowToClose = document.getElementById(selectedProcessId);
                if (windowToClose) {
                    windowToClose.classList.add('hidden');
                    showMessageBox("Task Ended", `Task '${selectedProcessId}' has been ended.`);
                    renderProcessList(); // Refresh list after closing
                } else {
                    showMessageBox("Error", `Could not find window for task '${selectedProcessId}'.`);
                }
            });
        } else {
            showMessageBox("No Task Selected", "Please select a task from the list to end.");
        }
    });

    // Ensure task manager list is updated when it opens
    taskManagerWindow.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && !taskManagerWindow.classList.contains('hidden')) {
            renderProcessList();
        }
    });

    // --- Sticky Notes Logic ---
    const saveStickyNotes = () => {
        localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
    };

    const renderStickyNotes = () => {
        stickyNotesContainer.innerHTML = '';
        stickyNotes.forEach(noteData => {
            createStickyNoteElement(noteData);
        });
    };

    const createStickyNoteElement = (noteData) => {
        const noteEl = document.createElement('div');
        noteEl.className = 'sticky-note pointer-events-auto';
        noteEl.id = noteData.id;
        noteEl.style.left = `${noteData.x}px`;
        noteEl.style.top = `${noteData.y}px`;
        noteEl.style.width = `${noteData.width}px`;
        noteEl.style.height = `${noteData.height}px`;

        noteEl.innerHTML = `
            <div class="title-bar flex items-center justify-between p-2 cursor-grab">
                <span class="material-symbols-outlined text-yellow-500">sticky_note_2</span>
                <span class="text-sm font-semibold">Sticky Note</span>
                <button class="close-btn-note p-1 rounded-full hover:bg-red-300 transition-colors">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
            <textarea class="sticky-note-textarea flex-grow" placeholder="Write your note here...">${noteData.content}</textarea>
            <div class="sticky-note-toolbar">
                <button class="save-note-btn text-sm">Save</button>
                <button class="delete-note-btn text-sm">Delete</button>
            </div>
            <div class="resize-handle"></div>
        `;

        stickyNotesContainer.appendChild(noteEl);

        // Drag and resize for sticky notes
        const titleBar = noteEl.querySelector('.title-bar');
        const resizeHandle = noteEl.querySelector('.resize-handle');
        titleBar.addEventListener('mousedown', e => startAction(e, noteEl, 'drag'));
        titleBar.addEventListener('touchstart', e => startAction(e, noteEl, 'drag'));
        resizeHandle.addEventListener('mousedown', e => startAction(e, noteEl, 'resize'));
        resizeHandle.addEventListener('touchstart', e => startAction(e, noteEl, 'resize'));

        // Bring to front on click
        noteEl.addEventListener('mousedown', () => {
            activeWindow = noteEl; // Treat notes as windows for Z-index
            updateWindowsZIndex();
        });
        noteEl.addEventListener('touchstart', () => {
            activeWindow = noteEl;
            updateWindowsZIndex();
        });

        // Save note content on input and button click
        const textarea = noteEl.querySelector('.sticky-note-textarea');
        textarea.addEventListener('input', () => {
            const noteIndex = stickyNotes.findIndex(note => note.id === noteData.id);
            if (noteIndex !== -1) {
                stickyNotes[noteIndex].content = textarea.value;
                saveStickyNotes();
            }
        });

        noteEl.querySelector('.save-note-btn').addEventListener('click', () => {
            showMessageBox('Note Saved', 'Your sticky note has been saved.');
        });

        noteEl.querySelector('.delete-note-btn').addEventListener('click', () => {
            showConfirmBox('Delete Note', 'Are you sure you want to delete this sticky note?', () => {
                stickyNotes = stickyNotes.filter(note => note.id !== noteData.id);
                noteEl.remove();
                saveStickyNotes();
                showMessageBox('Note Deleted', 'Sticky note removed.');
            });
        });

        noteEl.querySelector('.close-btn-note').addEventListener('click', () => {
            noteEl.remove();
            stickyNotes = stickyNotes.filter(note => note.id !== noteData.id);
            saveStickyNotes();
        });
    };

    newStickyNoteContextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        desktopContextMenu.classList.add('hidden');
        const newNote = {
            id: `sticky-note-${Date.now()}`,
            content: '',
            x: Math.random() * (window.innerWidth - 300) + 50, // Random position
            y: Math.random() * (window.innerHeight - 300) + 50,
            width: 250,
            height: 250
        };
        stickyNotes.push(newNote);
        createStickyNoteElement(newNote);
        saveStickyNotes();
        showMessageBox('New Note', 'A new sticky note has been created on your desktop.');
    });

    // Initial render of sticky notes
    renderStickyNotes();

    // --- Updater Hub Logic ---

    const saveInstalledApps = () => {
        localStorage.setItem('installedApps', JSON.stringify(installedApps));
    };

    const updateAppAvailability = () => {
        // Update the installed state based on localStorage for installable apps
        for (const appId in installableApplications) {
            if (!installableApplications[appId].isCore) { // Only update non-core apps from localStorage
                installableApplications[appId].installed = !!installedApps[appId];
            }
        }
        renderInstallableApps(); // Re-render Start Menu and Dock
        renderUpdaterHub(); // Re-render Updater Hub content
        renderDesktopIcons(); // Re-render desktop icons
    };

    const renderUpdaterHub = () => {
        availableUpdatesList.innerHTML = '';
        installationLog.innerHTML = localStorage.getItem('installationLog') || ''; // Load previous log

        for (const appId in installableApplications) {
            const app = installableApplications[appId];
            // Don't show core apps in the updater hub unless explicitly needed for updates
            if (app.isCore && appId !== 'updates') continue; 

            const updateItem = document.createElement('div');
            updateItem.className = `update-item ${app.installed ? 'installed' : ''}`;
            
            let buttonHtml = '';
            if (app.installed) {
                if (app.uninstallable === false) { // Specific check for non-uninstallable apps like Windows Defender
                    buttonHtml = `<span class="text-sm text-gray-500">System App</span>`;
                } else {
                    buttonHtml = `<button class="uninstall-btn px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors" data-app-id="${appId}">Uninstall</button>`;
                }
            } else {
                buttonHtml = `<button class="install-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors" data-app-id="${appId}">Install</button>`;
            }

            updateItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="material-symbols-outlined text-2xl ${app.color}">${app.icon}</span>
                    <div>
                        <p class="font-semibold text-white">${app.name}</p>
                        <p class="text-xs text-gray-400">${app.installed ? 'Installed' : 'Available'}</p>
                    </div>
                </div>
                ${buttonHtml}
            `;
            availableUpdatesList.appendChild(updateItem);
        }

        document.querySelectorAll('.install-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const appId = e.target.getAttribute('data-app-id');
                await installApplication(appId);
            });
        });

        document.querySelectorAll('.uninstall-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const appId = e.target.getAttribute('data-app-id');
                await uninstallApplication(appId);
            });
        });
    };

    const appendLog = (message, type = 'info') => {
        const entry = document.createElement('div');
        entry.className = `update-log-entry text-gray-300`;
        if (type === 'error') entry.classList.add('text-red-400');
        if (type === 'success') entry.classList.add('text-green-400');
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        installationLog.appendChild(entry);
        installationLog.scrollTop = installationLog.scrollHeight;
        // Save log to local storage
        localStorage.setItem('installationLog', installationLog.innerHTML);
    };

    const installApplication = async (appId) => {
        const app = installableApplications[appId];
        if (!app || app.installed) {
            showMessageBox("Installation Failed", `${app.name} is already installed or not found.`);
            return;
        }

        appendLog(`Starting installation for ${app.name}...`);
        const installButton = document.querySelector(`.install-btn[data-app-id="${appId}"]`);
        if (installButton) {
            installButton.disabled = true; // Disable button immediately
            installButton.textContent = 'Installing...';
            installButton.classList.add('opacity-50');
        }


        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate installation time

        installedApps[appId] = true;
        saveInstalledApps();
        updateAppAvailability(); // Re-render UI elements
        appendLog(`${app.name} installed successfully!`, 'success');
        showMessageBox("Installation Complete", `${app.name} has been successfully installed!`);
    };

    const uninstallApplication = async (appId) => {
        const app = installableApplications[appId];
        if (!app || !app.installed) {
            showMessageBox("Uninstallation Failed", `${app.name} is not installed or not found.`);
            return;
        }

        if (app.uninstallable === false) {
            showMessageBox("Uninstallation Restricted", `${app.name} is a core system application and cannot be uninstalled.`);
            appendLog(`Attempted uninstallation of unremovable app: ${app.name}.`, 'error');
            return;
        }

        showConfirmBox("Confirm Uninstallation", `Are you sure you want to uninstall ${app.name}?`, async () => {
            appendLog(`Starting uninstallation for ${app.name}...`);
            const uninstallButton = document.querySelector(`.uninstall-btn[data-app-id="${appId}"]`);
            if (uninstallButton) {
                uninstallButton.disabled = true;
                uninstallButton.textContent = 'Uninstalling...';
                uninstallButton.classList.add('opacity-50');
            }

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate uninstallation time

            delete installedApps[appId]; // Remove from installed apps
            saveInstalledApps();
            updateAppAvailability(); // Re-render UI elements
            appendLog(`${app.name} uninstalled successfully!`, 'success');
            showMessageBox("Uninstallation Complete", `${app.name} has been successfully uninstalled.`);
        });
    };


    const renderInstallableApps = () => {
        const dockInstallableApps = document.getElementById('dock-installable-apps');
        dockInstallableApps.innerHTML = '';
        startMenuInstallableApps.innerHTML = ''; // Clear for Start Menu

        for (const appId in installableApplications) {
            const app = installableApplications[appId];
            if (app.installed) {
                // Add to Dock
                // Check if the app is a core app, if so, it's already in the HTML.
                // Otherwise, add it dynamically if it's installed.
                if (!app.isCore) {
                    const dockButton = document.createElement('button');
                    dockButton.className = `dock-icon h-14 w-14 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all transform hover:scale-110`;
                    dockButton.setAttribute('data-window', app.windowId);
                    dockButton.innerHTML = `<span class="material-symbols-outlined text-3xl ${app.color}">${app.icon}</span>`;
                    dockButton.addEventListener('click', e => {
                        e.stopPropagation();
                        openWindow(app.windowId);
                    });
                    dockInstallableApps.appendChild(dockButton);
                }

                // Add to Start Menu
                const startMenuLink = document.createElement('a');
                startMenuLink.href = "#";
                startMenuLink.className = "start-menu-app-icon flex items-center space-x-3 p-2 rounded-xl hover:bg-white/30 dark:hover:bg-black/30 transition-colors";
                startMenuLink.setAttribute('data-window', app.windowId);
                startMenuLink.innerHTML = `<span class="material-symbols-outlined ${app.color}">${app.icon}</span><span>${app.name}</span>`;
                 startMenuLink.addEventListener('click', e => {
                    e.preventDefault();
                    openWindow(app.windowId);
                    startMenu.classList.add('hidden'); // Close start menu on app launch
                });
                startMenuInstallableApps.appendChild(startMenuLink);
            }
        }
    };

    // --- Desktop Icons Logic ---
    const renderDesktopIcons = () => {
        desktopIconsContainer.innerHTML = ''; // Clear existing icons
        if (!showDesktopIcons) {
            desktopIconsContainer.classList.add('hidden');
            return;
        } else {
            desktopIconsContainer.classList.remove('hidden');
        }

        for (const appId in installableApplications) {
            const app = installableApplications[appId];
            // Only render desktop icons for apps that are marked for desktop display AND are installed (or are core apps)
            if (app.desktopIcon && (app.installed || app.isCore)) {
                const iconElement = document.createElement('div');
                iconElement.className = 'flex flex-col items-center p-2 w-24 rounded-lg hover:bg-white/20 cursor-pointer text-white';
                iconElement.setAttribute('data-window', app.windowId);
                iconElement.innerHTML = `
                    <span class="material-symbols-outlined text-5xl ${app.color}">${app.icon}</span>
                    <span class="text-xs text-center mt-1">${app.name}</span>
                `;

                iconElement.addEventListener('click', () => {
                    openWindow(app.windowId);
                });
                desktopIconsContainer.appendChild(iconElement);
            }
        }
    };


    // --- Windows Defender Logic ---
    const defenderStatusDisplay = document.getElementById('defender-status');
    const quickScanBtn = document.getElementById('quick-scan-btn');
    const fullScanBtn = document.getElementById('full-scan-btn');

    const updateDefenderStatus = (message, type = 'info') => {
        defenderStatusDisplay.textContent = message;
        defenderStatusDisplay.classList.remove('text-red-400', 'text-green-300', 'text-yellow-400', 'text-gray-300'); // Reset all
        if (type === 'error') defenderStatusDisplay.classList.add('text-red-400');
        else if (type === 'success') defenderStatusDisplay.classList.add('text-green-300');
        else if (type === 'warning') defenderStatusDisplay.classList.add('text-yellow-400');
        else defenderStatusDisplay.classList.add('text-gray-300'); // Default for info
    };

    const simulateScan = (scanType, duration) => {
        return new Promise(resolve => {
            updateDefenderStatus(`Performing ${scanType} scan...`, 'info');
            setTimeout(() => {
                const threatsFound = Math.random() > 0.8; // 20% chance of finding threats
                if (threatsFound) {
                    updateDefenderStatus(`Scan complete. Threats detected! Action required.`, 'error');
                    showMessageBox("Threats Detected", "Malicious files found! Please take action.");
                } else {
                    updateDefenderStatus(`Scan complete. No threats found. Your system is safe.`, 'success');
                    showMessageBox("Scan Complete", "No threats found. Your system is safe.");
                }
                resolve();
            }, duration);
        });
    };

    // Check if elements exist before adding event listeners to prevent errors if Defender is not installed yet
    if (quickScanBtn) { 
        quickScanBtn.addEventListener('click', async () => {
            quickScanBtn.disabled = true;
            fullScanBtn.disabled = true;
            await simulateScan('quick', 2000); // 2 seconds for quick scan
            quickScanBtn.disabled = false;
            fullScanBtn.disabled = false;
        });
    }

    if (fullScanBtn) { 
        fullScanBtn.addEventListener('click', async () => {
            quickScanBtn.disabled = true;
            fullScanBtn.disabled = true;
            await simulateScan('full', 5000); // 5 seconds for full scan
            quickScanBtn.disabled = false;
            fullScanBtn.disabled = false;
        });
    }

    // --- Calendar Logic ---
    const renderCalendar = () => {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth(); // 0-indexed

        currentMonthYearDisplay.textContent = `${currentCalendarDate.toLocaleString('en-US', { month: 'long' })} ${year}`;
        calendarGrid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const numDays = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 6 for Saturday

        // Add empty cells for days before the 1st
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'p-2 text-center text-gray-500';
            calendarGrid.appendChild(emptyCell);
        }

        // Add days of the month
        for (let day = 1; day <= numDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'p-2 text-center rounded-md cursor-pointer hover:bg-purple-700 transition-colors text-white';
            dayCell.textContent = day;

            // Highlight today's date
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('bg-blue-600', 'font-bold');
            }
            calendarGrid.appendChild(dayCell);
        }
    };

    prevMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });

    // Initial setup calls
    updateAppAvailability(); // Call on load to reflect previously installed apps
    renderUpdaterHub(); // Render Updater Hub content
    renderDesktopIcons(); // Render desktop icons on load
    renderCalendar(); // Initial render of the calendar when script loads

    // Ensure Updater Hub content updates when its tab is clicked in Update Center
    document.querySelector('.updates-tab[data-content-id="updater-hub-content"]').addEventListener('click', (e) => {
        e.preventDefault();
        updatesTabs.forEach(t => t.classList.remove('bg-white/20', 'dark:bg-black/20'));
        updatesContents.forEach(c => c.classList.add('hidden'));
        e.target.classList.add('bg-white/20', 'dark:bg-black/20');
        document.getElementById('updater-hub-content').classList.remove('hidden');
        renderUpdaterHub(); // Re-render when hub tab is selected
    });
});
