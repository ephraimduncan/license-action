require('./sourcemap-register.js');module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(351);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 16:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const InitSummary_1 = __webpack_require__(690);
const bareCommand = '--bare';
function hasBareCommand(command) {
    return command.includes(bareCommand);
}
function initTask(bare = false, path, customArgs) {
    const commands = ['init', ...customArgs];
    if (bare && !hasBareCommand(commands)) {
        commands.splice(1, 0, bareCommand);
    }
    return {
        commands,
        concatStdErr: false,
        format: 'utf-8',
        parser(text) {
            return InitSummary_1.parseInit(commands.includes('--bare'), path, text);
        }
    };
}
exports.initTask = initTask;
//# sourceMappingURL=init.js.map

/***/ }),

/***/ 17:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const git_response_error_1 = __webpack_require__(131);
const parse_branch_delete_1 = __webpack_require__(86);
const parse_branch_1 = __webpack_require__(264);
function containsDeleteBranchCommand(commands) {
    const deleteCommands = ['-d', '-D', '--delete'];
    return commands.some(command => deleteCommands.includes(command));
}
exports.containsDeleteBranchCommand = containsDeleteBranchCommand;
function branchTask(customArgs) {
    const isDelete = containsDeleteBranchCommand(customArgs);
    const commands = ['branch', ...customArgs];
    if (commands.length === 1) {
        commands.push('-a');
    }
    if (!commands.includes('-v')) {
        commands.splice(1, 0, '-v');
    }
    return {
        format: 'utf-8',
        commands,
        parser(stdOut, stdErr) {
            if (isDelete) {
                return parse_branch_delete_1.parseBranchDeletions(stdOut, stdErr).all[0];
            }
            return parse_branch_1.parseBranchSummary(stdOut, stdErr);
        },
    };
}
exports.branchTask = branchTask;
function branchLocalTask() {
    return {
        format: 'utf-8',
        commands: ['branch', '-v'],
        parser(stdOut, stdErr) {
            return parse_branch_1.parseBranchSummary(stdOut, stdErr);
        },
    };
}
exports.branchLocalTask = branchLocalTask;
function deleteBranchesTask(branches, forceDelete = false) {
    return {
        format: 'utf-8',
        commands: ['branch', '-v', forceDelete ? '-D' : '-d', ...branches],
        parser(stdOut, stdErr) {
            return parse_branch_delete_1.parseBranchDeletions(stdOut, stdErr);
        },
        onError(exitCode, error, done, fail) {
            if (!parse_branch_delete_1.hasBranchDeletionError(error, exitCode)) {
                return fail(error);
            }
            done(error);
        },
        concatStdErr: true,
    };
}
exports.deleteBranchesTask = deleteBranchesTask;
function deleteBranchTask(branch, forceDelete = false) {
    const task = {
        format: 'utf-8',
        commands: ['branch', '-v', forceDelete ? '-D' : '-d', branch],
        parser(stdOut, stdErr) {
            return parse_branch_delete_1.parseBranchDeletions(stdOut, stdErr).branches[branch];
        },
        onError(exitCode, error, _, fail) {
            if (!parse_branch_delete_1.hasBranchDeletionError(error, exitCode)) {
                return fail(error);
            }
            throw new git_response_error_1.GitResponseError(task.parser(error, ''), error);
        },
        concatStdErr: true,
    };
    return task;
}
exports.deleteBranchTask = deleteBranchTask;
//# sourceMappingURL=branch.js.map

/***/ }),

/***/ 86:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const BranchDeleteSummary_1 = __webpack_require__(755);
const utils_1 = __webpack_require__(847);
const deleteSuccessRegex = /(\S+)\s+\(\S+\s([^)]+)\)/;
const deleteErrorRegex = /^error[^']+'([^']+)'/m;
const parsers = [
    new utils_1.LineParser(deleteSuccessRegex, (result, [branch, hash]) => {
        const deletion = BranchDeleteSummary_1.branchDeletionSuccess(branch, hash);
        result.all.push(deletion);
        result.branches[branch] = deletion;
    }),
    new utils_1.LineParser(deleteErrorRegex, (result, [branch]) => {
        const deletion = BranchDeleteSummary_1.branchDeletionFailure(branch);
        result.errors.push(deletion);
        result.all.push(deletion);
        result.branches[branch] = deletion;
    }),
];
exports.parseBranchDeletions = (stdOut) => {
    return utils_1.parseStringResponse(new BranchDeleteSummary_1.BranchDeletionBatch(), parsers, stdOut);
};
function hasBranchDeletionError(data, processExitCode) {
    return processExitCode === utils_1.ExitCodes.ERROR && deleteErrorRegex.test(data);
}
exports.hasBranchDeletionError = hasBranchDeletionError;
//# sourceMappingURL=parse-branch-delete.js.map

/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 131:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const git_error_1 = __webpack_require__(757);
/**
 * The `GitResponseError` is the wrapper for a parsed response that is treated as
 * a fatal error, for example attempting a `merge` can leave the repo in a corrupted
 * state when there are conflicts so the task will reject rather than resolve.
 *
 * For example, catching the merge conflict exception:
 *
 * ```typescript
 import { gitP, SimpleGit, GitResponseError, MergeSummary } from 'simple-git';

 const git = gitP(repoRoot);
 const mergeOptions: string[] = ['--no-ff', 'other-branch'];
 const mergeSummary: MergeSummary = await git.merge(mergeOptions)
      .catch((e: GitResponseError<MergeSummary>) => e.git);

 if (mergeSummary.failed) {
   // deal with the error
 }
 ```
 */
class GitResponseError extends git_error_1.GitError {
    constructor(
    /**
     * `.git` access the parsed response that is treated as being an error
     */
    git, message) {
        super(undefined, message || String(git));
        this.git = git;
    }
}
exports.GitResponseError = GitResponseError;
//# sourceMappingURL=git-response-error.js.map

/***/ }),

/***/ 169:
/***/ (function(module) {

"use strict";


function FetchSummary (raw) {
   this.raw = raw;

   this.remote = null;
   this.branches = [];
   this.tags = [];
}

FetchSummary.parsers = [
   [
      /From (.+)$/, function (fetchSummary, matches) {
         fetchSummary.remote = matches[0];
      }
   ],
   [
      /\* \[new branch\]\s+(\S+)\s*\-> (.+)$/, function (fetchSummary, matches) {
         fetchSummary.branches.push({
            name: matches[0],
            tracking: matches[1]
         });
      }
   ],
   [
      /\* \[new tag\]\s+(\S+)\s*\-> (.+)$/, function (fetchSummary, matches) {
         fetchSummary.tags.push({
            name: matches[0],
            tracking: matches[1]
         });
      }
   ]
];

FetchSummary.parse = function (data) {
   var fetchSummary = new FetchSummary(data);

   String(data)
      .trim()
      .split('\n')
      .forEach(function (line) {
         var original = line.trim();
         FetchSummary.parsers.some(function (parser) {
            var parsed = parser[0].exec(original);
            if (parsed) {
               parser[1](fetchSummary, parsed.slice(1));
               return true;
            }
         });
      });

   return fetchSummary;
};

module.exports = FetchSummary;


/***/ }),

/***/ 178:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __webpack_require__(231);
const utils_1 = __webpack_require__(847);
debug_1.default.formatters.L = (value) => utils_1.filterHasLength(value) ? value.length : '-';
debug_1.default.formatters.B = (value) => {
    if (Buffer.isBuffer(value)) {
        return value.toString('utf8');
    }
    return utils_1.objectToString(value);
};
/**
 * The shared debug logging instance
 */
exports.log = debug_1.default('simple-git');
function prefixedLogger(to, prefix, forward) {
    if (!prefix || !String(prefix).replace(/\s*/, '')) {
        return !forward ? to : (message, ...args) => {
            to(message, ...args);
            forward(message, ...args);
        };
    }
    return (message, ...args) => {
        to(`%s ${message}`, prefix, ...args);
        if (forward) {
            forward(message, ...args);
        }
    };
}
function childLoggerName(name, childDebugger, { namespace: parentNamespace }) {
    if (typeof name === 'string') {
        return name;
    }
    const childNamespace = childDebugger && childDebugger.namespace || '';
    if (childNamespace.startsWith(parentNamespace)) {
        return childNamespace.substr(parentNamespace.length + 1);
    }
    return childNamespace || parentNamespace;
}
function createLogger(label, verbose, initialStep, infoDebugger = exports.log) {
    const labelPrefix = label && `[${label}]` || '';
    const spawned = [];
    const debugDebugger = (typeof verbose === 'string') ? infoDebugger.extend(verbose) : verbose;
    const key = childLoggerName(utils_1.filterType(verbose, utils_1.filterString), debugDebugger, infoDebugger);
    const kill = ((debugDebugger === null || debugDebugger === void 0 ? void 0 : debugDebugger.destroy) || utils_1.NOOP).bind(debugDebugger);
    return step(initialStep);
    function destroy() {
        kill();
        spawned.forEach(logger => logger.destroy());
        spawned.length = 0;
    }
    function child(name) {
        return utils_1.append(spawned, createLogger(label, debugDebugger && debugDebugger.extend(name) || name));
    }
    function sibling(name, initial) {
        return utils_1.append(spawned, createLogger(label, key.replace(/^[^:]+/, name), initial, infoDebugger));
    }
    function step(phase) {
        const stepPrefix = phase && `[${phase}]` || '';
        const debug = debugDebugger && prefixedLogger(debugDebugger, stepPrefix) || utils_1.NOOP;
        const info = prefixedLogger(infoDebugger, `${labelPrefix} ${stepPrefix}`, debug);
        return Object.assign(debugDebugger ? debug : info, {
            key,
            label,
            child,
            sibling,
            debug,
            info,
            step,
            destroy,
        });
    }
}
exports.createLogger = createLogger;
/**
 * The `GitLogger` is used by the main `SimpleGit` runner to handle logging
 * any warnings or errors.
 */
class GitLogger {
    constructor(_out = exports.log) {
        this._out = _out;
        this.error = prefixedLogger(_out, '[ERROR]');
        this.warn = prefixedLogger(_out, '[WARN]');
    }
    silent(silence = false) {
        if (silence !== this._out.enabled) {
            return;
        }
        const { namespace } = this._out;
        const env = (process.env.DEBUG || '').split(',').filter(s => !!s);
        const hasOn = env.includes(namespace);
        const hasOff = env.includes(`-${namespace}`);
        // enabling the log
        if (!silence) {
            if (hasOff) {
                utils_1.remove(env, `-${namespace}`);
            }
            else {
                env.push(namespace);
            }
        }
        else {
            if (hasOn) {
                utils_1.remove(env, namespace);
            }
            else {
                env.push(`-${namespace}`);
            }
        }
        debug_1.default.enable(env.join(','));
    }
}
exports.GitLogger = GitLogger;
//# sourceMappingURL=git-logger.js.map

/***/ }),

/***/ 185:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Known process exit codes used by the task parsers to determine whether an error
 * was one they can automatically handle
 */
var ExitCodes;
(function (ExitCodes) {
    ExitCodes[ExitCodes["SUCCESS"] = 0] = "SUCCESS";
    ExitCodes[ExitCodes["ERROR"] = 1] = "ERROR";
    ExitCodes[ExitCodes["UNCLEAN"] = 128] = "UNCLEAN";
})(ExitCodes = exports.ExitCodes || (exports.ExitCodes = {}));
//# sourceMappingURL=exit-codes.js.map

/***/ }),

/***/ 186:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(241);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = command_1.toCommandValue(val);
    process.env[name] = convertedVal;
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 197:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const StatusSummary_1 = __webpack_require__(790);
function statusTask(customArgs) {
    return {
        format: 'utf-8',
        commands: ['status', '--porcelain', '-b', '-u', ...customArgs],
        parser(text) {
            return StatusSummary_1.parseStatusSummary(text);
        }
    };
}
exports.statusTask = statusTask;
//# sourceMappingURL=status.js.map

/***/ }),

/***/ 218:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    binary: 'git',
    maxConcurrentProcesses: 5,
};
function createInstanceConfig(...options) {
    const baseDir = process.cwd();
    const config = Object.assign(Object.assign({ baseDir }, defaultOptions), ...(options.filter(o => typeof o === 'object' && o)));
    config.baseDir = config.baseDir || baseDir;
    return config;
}
exports.createInstanceConfig = createInstanceConfig;
//# sourceMappingURL=simple-git-options.js.map

/***/ }),

/***/ 219:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
class ConfigList {
    constructor() {
        this.files = [];
        this.values = Object.create(null);
    }
    get all() {
        if (!this._all) {
            this._all = this.files.reduce((all, file) => {
                return Object.assign(all, this.values[file]);
            }, {});
        }
        return this._all;
    }
    addFile(file) {
        if (!(file in this.values)) {
            const latest = utils_1.last(this.files);
            this.values[file] = latest ? Object.create(this.values[latest]) : {};
            this.files.push(file);
        }
        return this.values[file];
    }
    addValue(file, key, value) {
        const values = this.addFile(file);
        if (!values.hasOwnProperty(key)) {
            values[key] = value;
        }
        else if (Array.isArray(values[key])) {
            values[key].push(value);
        }
        else {
            values[key] = [values[key], value];
        }
        this._all = undefined;
    }
}
exports.ConfigList = ConfigList;
function configListParser(text) {
    const config = new ConfigList();
    const lines = text.split('\0');
    for (let i = 0, max = lines.length - 1; i < max;) {
        const file = configFilePath(lines[i++]);
        const [key, value] = utils_1.splitOn(lines[i++], '\n');
        config.addValue(file, key, value);
    }
    return config;
}
exports.configListParser = configListParser;
function configFilePath(filePath) {
    return filePath.replace(/^(file):/, '');
}
//# sourceMappingURL=ConfigList.js.map

/***/ }),

/***/ 221:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
var CheckRepoActions;
(function (CheckRepoActions) {
    CheckRepoActions["BARE"] = "bare";
    CheckRepoActions["IN_TREE"] = "tree";
    CheckRepoActions["IS_REPO_ROOT"] = "root";
})(CheckRepoActions = exports.CheckRepoActions || (exports.CheckRepoActions = {}));
const onError = (exitCode, stdErr, done, fail) => {
    if (exitCode === utils_1.ExitCodes.UNCLEAN && isNotRepoMessage(stdErr)) {
        return done('false');
    }
    fail(stdErr);
};
const parser = (text) => {
    return text.trim() === 'true';
};
function checkIsRepoTask(action) {
    switch (action) {
        case CheckRepoActions.BARE:
            return checkIsBareRepoTask();
        case CheckRepoActions.IS_REPO_ROOT:
            return checkIsRepoRootTask();
    }
    const commands = ['rev-parse', '--is-inside-work-tree'];
    return {
        commands,
        format: 'utf-8',
        onError,
        parser,
    };
}
exports.checkIsRepoTask = checkIsRepoTask;
function checkIsRepoRootTask() {
    const commands = ['rev-parse', '--git-dir'];
    return {
        commands,
        format: 'utf-8',
        onError,
        parser(path) {
            return /^\.(git)?$/.test(path.trim());
        },
    };
}
exports.checkIsRepoRootTask = checkIsRepoRootTask;
function checkIsBareRepoTask() {
    const commands = ['rev-parse', '--is-bare-repository'];
    return {
        commands,
        format: 'utf-8',
        onError,
        parser,
    };
}
exports.checkIsBareRepoTask = checkIsBareRepoTask;
function isNotRepoMessage(message) {
    return /(Not a git repository|Kein Git-Repository)/i.test(message);
}
//# sourceMappingURL=check-is-repo.js.map

/***/ }),

/***/ 222:
/***/ (function(module, exports, __webpack_require__) {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */
function log(...args) {
	// This hackery is required for IE8/9, where
	// the `console.log` function doesn't have 'apply'
	return typeof console === 'object' &&
		console.log &&
		console.log(...args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(243)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 231:
/***/ (function(module, __unusedexports, __webpack_require__) {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(222);
} else {
	module.exports = __webpack_require__(332);
}


/***/ }),

/***/ 237:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const file_exists_1 = __webpack_require__(751);
exports.NOOP = () => {
};
/**
 * Returns either the source argument when it is a `Function`, or the default
 * `NOOP` function constant
 */
function asFunction(source) {
    return typeof source === 'function' ? source : exports.NOOP;
}
exports.asFunction = asFunction;
/**
 * Determines whether the supplied argument is both a function, and is not
 * the `NOOP` function.
 */
function isUserFunction(source) {
    return (typeof source === 'function' && source !== exports.NOOP);
}
exports.isUserFunction = isUserFunction;
function splitOn(input, char) {
    const index = input.indexOf(char);
    if (index <= 0) {
        return [input, ''];
    }
    return [
        input.substr(0, index),
        input.substr(index + 1),
    ];
}
exports.splitOn = splitOn;
function last(input) {
    return input && input.length ? input[input.length - 1] : undefined;
}
exports.last = last;
function toLinesWithContent(input, trimmed = true) {
    return input.split('\n')
        .reduce((output, line) => {
        const lineContent = trimmed ? line.trim() : line;
        if (lineContent) {
            output.push(lineContent);
        }
        return output;
    }, []);
}
exports.toLinesWithContent = toLinesWithContent;
function forEachLineWithContent(input, callback) {
    return toLinesWithContent(input, true).map(line => callback(line));
}
exports.forEachLineWithContent = forEachLineWithContent;
function folderExists(path) {
    return file_exists_1.exists(path, file_exists_1.FOLDER);
}
exports.folderExists = folderExists;
/**
 * Adds `item` into the `target` `Array` or `Set` when it is not already present.
 */
function append(target, item) {
    if (Array.isArray(target)) {
        if (!target.includes(item)) {
            target.push(item);
        }
    }
    else {
        target.add(item);
    }
    return item;
}
exports.append = append;
function remove(target, item) {
    if (Array.isArray(target)) {
        const index = target.indexOf(item);
        if (index >= 0) {
            target.splice(index, 1);
        }
    }
    else {
        target.delete(item);
    }
    return item;
}
exports.remove = remove;
exports.objectToString = Object.prototype.toString.call.bind(Object.prototype.toString);
function asArray(source) {
    return Array.isArray(source) ? source : [source];
}
exports.asArray = asArray;
function asStringArray(source) {
    return asArray(source).map(String);
}
exports.asStringArray = asStringArray;
function asNumber(source, onNaN = 0) {
    if (source == null) {
        return onNaN;
    }
    const num = parseInt(source, 10);
    return isNaN(num) ? onNaN : num;
}
exports.asNumber = asNumber;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 241:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
function escapeData(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 243:
/***/ (function(module, __unusedexports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(900);

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 264:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const BranchSummary_1 = __webpack_require__(446);
const utils_1 = __webpack_require__(847);
const parsers = [
    new utils_1.LineParser(/^(\*\s)?\((?:HEAD )?detached (?:from|at) (\S+)\)\s+([a-z0-9]+)\s(.*)$/, (result, [current, name, commit, label]) => {
        result.push(!!current, true, name, commit, label);
    }),
    new utils_1.LineParser(/^(\*\s)?(\S+)\s+([a-z0-9]+)\s(.*)$/, (result, [current, name, commit, label]) => {
        result.push(!!current, false, name, commit, label);
    })
];
exports.parseBranchSummary = function (stdOut) {
    return utils_1.parseStringResponse(new BranchSummary_1.BranchSummaryResult(), parsers, stdOut);
};
//# sourceMappingURL=parse-branch.js.map

/***/ }),

/***/ 286:
/***/ (function(module) {


module.exports = DiffSummary;

/**
 * The DiffSummary is returned as a response to getting `git().status()`
 *
 * @constructor
 */
function DiffSummary () {
   this.files = [];
   this.insertions = 0;
   this.deletions = 0;
   this.changed = 0;
}

/**
 * Number of lines added
 * @type {number}
 */
DiffSummary.prototype.insertions = 0;

/**
 * Number of lines deleted
 * @type {number}
 */
DiffSummary.prototype.deletions = 0;

/**
 * Number of files changed
 * @type {number}
 */
DiffSummary.prototype.changed = 0;

DiffSummary.parse = function (text) {
   var line, handler;

   var lines = text.trim().split('\n');
   var status = new DiffSummary();

   var summary = lines.pop();
   if (summary) {
      summary.trim().split(', ').forEach(function (text) {
         var summary = /(\d+)\s([a-z]+)/.exec(text);
         if (!summary) {
            return;
         }

         if (/files?/.test(summary[2])) {
            status.changed = parseInt(summary[1], 10);
         }
         else {
            status[summary[2].replace(/s$/, '') + 's'] = parseInt(summary[1], 10);
         }
      });
   }

   while (line = lines.shift()) {
      textFileChange(line, status.files) || binaryFileChange(line, status.files);
   }

   return status;
};

function textFileChange (line, files) {
   line = line.trim().match(/^(.+)\s+\|\s+(\d+)(\s+[+\-]+)?$/);

   if (line) {
      var alterations = (line[3] || '').trim();
      files.push({
         file: line[1].trim(),
         changes: parseInt(line[2], 10),
         insertions: alterations.replace(/-/g, '').length,
         deletions: alterations.replace(/\+/g, '').length,
         binary: false
      });

      return true;
   }
}

function binaryFileChange (line, files) {
   line = line.match(/^(.+) \|\s+Bin ([0-9.]+) -> ([0-9.]+) ([a-z]+)$/);
   if (line) {
      files.push({
         file: line[1].trim(),
         before: +line[2],
         after: +line[3],
         binary: true
      });
      return true;
   }
}


/***/ }),

/***/ 301:
/***/ (function(module, __unusedexports, __webpack_require__) {


module.exports = {
   CommitSummary: __webpack_require__(921),
   DiffSummary: __webpack_require__(286),
   FetchSummary: __webpack_require__(169),
   ListLogSummary: __webpack_require__(507),
};


/***/ }),

/***/ 318:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const os = __webpack_require__(87);
const hasFlag = __webpack_require__(621);

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream && !stream.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};


/***/ }),

/***/ 332:
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(867);
const util = __webpack_require__(669);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(318);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(243)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.replace(/\s*\n\s*/g, ' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 351:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(186);
const simpleGit = __webpack_require__(577);
const git = simpleGit();

const {
  promises: { readdir, copyFile, readFile, writeFile },
} = __webpack_require__(747);
const { join } = __webpack_require__(622);

const mainDirectory = '.';

const license = 'LICENSE';
let directoryFiles = [];
let licenseFile = '';

async function checkLicense() {
  directoryFiles = await readdir(mainDirectory);
  directoryFiles.forEach((file) => {
    if (file.toLowerCase() === 'license' || file.toLowerCase() === 'license.md')
      throw new Error('Unable to Create License. License Available');
  });
}

async function createLicense(licenseType) {
  // Check For License Type
  async function checkLicenseType() {
    switch (licenseType) {
      case 'AGPL':
        licenseFile = 'agpl-3.0.txt';
        break;
      case 'Apache':
        licenseFile = 'apache-2.0.txt';
        break;
      case 'BSD':
        licenseFile = 'bsd-3.0.txt';
        break;
      case 'CC-BY':
        licenseFile = 'cc-by-4.0.txt';
        break;
      case 'CC-BY-NC':
        licenseFile = 'cc-by-nc-4.0.txt';
        break;
      case 'CC-BY-NC-SA':
        licenseFile = 'cc-by-nc-sa-4.0.txt';
        break;
      case 'CC-BY-SA':
        licenseFile = 'cc-by-sa-4.0.txt';
        break;
      case 'CC0':
        licenseFile = 'cc-zero-1.0.txt';
        break;
      case 'GPL':
        licenseFile = 'gpl-3.0.txt';
        break;
      case 'LGPL':
        licenseFile = 'lgpl-3.0.txt';
        break;
      case 'MIT':
        licenseFile = 'mit.txt';
        break;
      case 'MPL':
        licenseFile = 'mpl-2.0.txt';
        break;
      case 'Unlicense':
        licenseFile = 'unlicense.txt';
        break;
    }
  }

  await checkLicenseType();

  // Copy Text File
  await copyFile(
    join(__dirname, `files/${licenseFile}`),
    join(mainDirectory, license),
    (err) => {
      if (err) throw err;
    }
  );
}

async function replaceVariables() {
  readFile(license, 'utf-8', (err, data) => {
    if (err) throw err;

    let author = data.replace(/{AUTHOR}/gim, core.getInput('AUTHOR'));
    let year = data.replace(/{YEAR}/gim, new Date().getFullYear());

    writeFile(license, author, 'utf-8', function (err) {
      if (err) throw err;
      core.info('License Author Added');
    });

    writeFile(license, year, 'utf-8', function (err) {
      if (err) throw err;
      core.info('License Year Added');
    });

    if (core.getInput('PROJECT_NAME')) {
      let projectName = data.replace(
        /{PROJECT_NAME}/gim,
        core.getInput('PROJECT_NAME')
      );
      writeFile(license, projectName, 'utf-8', function (err) {
        if (err) throw err;
        core.info('License Project Name Added');
      });
    }
  });
}

async function commitFile() {
  await git.add('./*');
  await git.addConfig('user.name', process.env.GITHUB_ACTOR);
  await git.addConfig('user.email', core.getInput('EMAIL'));
  await git.commit('📝 Added License via dephraiim/license-action');
  await git.push();
}

async function run() {
  try {
    const license = core.getInput('LICENSE_TYPE');

    // Check If license is present
    await checkLicense();
    core.info(`Creating ${license} license ...`);

    // Create License if license is not present
    await createLicense(license);
    core.info(`${core.getInput('LICENSE_TYPE')} License Copied`);

    // Replace Name, Project and Year Variable
    await replaceVariables();
    core.info('License Info Added');

    // Commit License with Commit Message
    await commitFile();
    core.info('License Commit Complete.');

    core.info(`Created ${license} license!`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();


/***/ }),

/***/ 366:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(237);
function filterType(input, ...filters) {
    return filters.some((filter) => filter(input)) ? input : undefined;
}
exports.filterType = filterType;
exports.filterArray = (input) => {
    return Array.isArray(input);
};
exports.filterPrimitives = (input) => {
    return /number|string|boolean/.test(typeof input);
};
exports.filterString = (input) => {
    return typeof input === 'string';
};
exports.filterPlainObject = (input) => {
    return !!input && util_1.objectToString(input) === '[object Object]';
};
exports.filterFunction = (input) => {
    return typeof input === 'function';
};
exports.filterHasLength = (input) => {
    if (input == null) {
        return false;
    }
    const hasLength = typeof input === 'string' || (typeof input === 'object' && ('length' in input));
    return hasLength && typeof input.length === 'number';
};
//# sourceMappingURL=argument-filters.js.map

/***/ }),

/***/ 368:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(237);
function callTaskParser(parser, streams) {
    return parser(streams.stdOut, streams.stdErr);
}
exports.callTaskParser = callTaskParser;
function parseStringResponse(result, parsers, text) {
    for (let lines = util_1.toLinesWithContent(text), i = 0, max = lines.length; i < max; i++) {
        const line = (offset = 0) => {
            if ((i + offset) >= max) {
                return;
            }
            return lines[i + offset];
        };
        parsers.some(({ parse }) => parse(line, result));
    }
    return result;
}
exports.parseStringResponse = parseStringResponse;
//# sourceMappingURL=task-parser.js.map

/***/ }),

/***/ 377:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = __webpack_require__(815);
var ResetMode;
(function (ResetMode) {
    ResetMode["MIXED"] = "mixed";
    ResetMode["SOFT"] = "soft";
    ResetMode["HARD"] = "hard";
    ResetMode["MERGE"] = "merge";
    ResetMode["KEEP"] = "keep";
})(ResetMode = exports.ResetMode || (exports.ResetMode = {}));
const ResetModes = Array.from(Object.values(ResetMode));
function resetTask(mode, customArgs) {
    const commands = ['reset'];
    if (isValidResetMode(mode)) {
        commands.push(`--${mode}`);
    }
    commands.push(...customArgs);
    return task_1.straightThroughStringTask(commands);
}
exports.resetTask = resetTask;
function getResetMode(mode) {
    if (isValidResetMode(mode)) {
        return mode;
    }
    switch (typeof mode) {
        case 'string':
        case 'undefined':
            return ResetMode.SOFT;
    }
    return;
}
exports.getResetMode = getResetMode;
function isValidResetMode(mode) {
    return ResetModes.includes(mode);
}
//# sourceMappingURL=reset.js.map

/***/ }),

/***/ 386:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const CleanSummary_1 = __webpack_require__(689);
const utils_1 = __webpack_require__(847);
const task_1 = __webpack_require__(815);
exports.CONFIG_ERROR_INTERACTIVE_MODE = 'Git clean interactive mode is not supported';
exports.CONFIG_ERROR_MODE_REQUIRED = 'Git clean mode parameter ("n" or "f") is required';
exports.CONFIG_ERROR_UNKNOWN_OPTION = 'Git clean unknown option found in: ';
/**
 * All supported option switches available for use in a `git.clean` operation
 */
var CleanOptions;
(function (CleanOptions) {
    CleanOptions["DRY_RUN"] = "n";
    CleanOptions["FORCE"] = "f";
    CleanOptions["IGNORED_INCLUDED"] = "x";
    CleanOptions["IGNORED_ONLY"] = "X";
    CleanOptions["EXCLUDING"] = "e";
    CleanOptions["QUIET"] = "q";
    CleanOptions["RECURSIVE"] = "d";
})(CleanOptions = exports.CleanOptions || (exports.CleanOptions = {}));
const CleanOptionValues = new Set(['i', ...utils_1.asStringArray(Object.values(CleanOptions))]);
function cleanWithOptionsTask(mode, customArgs) {
    const { cleanMode, options, valid } = getCleanOptions(mode);
    if (!cleanMode) {
        return task_1.configurationErrorTask(exports.CONFIG_ERROR_MODE_REQUIRED);
    }
    if (!valid.options) {
        return task_1.configurationErrorTask(exports.CONFIG_ERROR_UNKNOWN_OPTION + JSON.stringify(mode));
    }
    options.push(...customArgs);
    if (options.some(isInteractiveMode)) {
        return task_1.configurationErrorTask(exports.CONFIG_ERROR_INTERACTIVE_MODE);
    }
    return cleanTask(cleanMode, options);
}
exports.cleanWithOptionsTask = cleanWithOptionsTask;
function cleanTask(mode, customArgs) {
    const commands = ['clean', `-${mode}`, ...customArgs];
    return {
        commands,
        format: 'utf-8',
        parser(text) {
            return CleanSummary_1.cleanSummaryParser(mode === CleanOptions.DRY_RUN, text);
        }
    };
}
exports.cleanTask = cleanTask;
function isCleanOptionsArray(input) {
    return Array.isArray(input) && input.every(test => CleanOptionValues.has(test));
}
exports.isCleanOptionsArray = isCleanOptionsArray;
function getCleanOptions(input) {
    let cleanMode;
    let options = [];
    let valid = { cleanMode: false, options: true };
    input.replace(/[^a-z]i/g, '').split('').forEach(char => {
        if (isCleanMode(char)) {
            cleanMode = char;
            valid.cleanMode = true;
        }
        else {
            valid.options = valid.options && isKnownOption(options[options.length] = (`-${char}`));
        }
    });
    return {
        cleanMode,
        options,
        valid,
    };
}
function isCleanMode(cleanMode) {
    return cleanMode === CleanOptions.FORCE || cleanMode === CleanOptions.DRY_RUN;
}
function isKnownOption(option) {
    return /^-[a-z]$/i.test(option) && CleanOptionValues.has(option.charAt(1));
}
function isInteractiveMode(option) {
    if (/^-[^\-]/.test(option)) {
        return option.indexOf('i') > 0;
    }
    return option === '--interactive';
}
//# sourceMappingURL=clean.js.map

/***/ }),

/***/ 412:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const MergeSummary_1 = __webpack_require__(651);
const utils_1 = __webpack_require__(847);
const parse_pull_1 = __webpack_require__(658);
const parsers = [
    new utils_1.LineParser(/^Auto-merging\s+(.+)$/, (summary, [autoMerge]) => {
        summary.merges.push(autoMerge);
    }),
    new utils_1.LineParser(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (summary, [reason, file]) => {
        summary.conflicts.push(new MergeSummary_1.MergeSummaryConflict(reason, file));
    }),
    new utils_1.LineParser(/^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/, (summary, [reason, file, deleteRef]) => {
        summary.conflicts.push(new MergeSummary_1.MergeSummaryConflict(reason, file, { deleteRef }));
    }),
    new utils_1.LineParser(/^CONFLICT\s+\((.+)\):/, (summary, [reason]) => {
        summary.conflicts.push(new MergeSummary_1.MergeSummaryConflict(reason, null));
    }),
    new utils_1.LineParser(/^Automatic merge failed;\s+(.+)$/, (summary, [result]) => {
        summary.result = result;
    }),
];
/**
 * Parse the complete response from `git.merge`
 */
exports.parseMergeResult = (stdOut, stdErr) => {
    return Object.assign(exports.parseMergeDetail(stdOut, stdErr), parse_pull_1.parsePullResult(stdOut, stdErr));
};
/**
 * Parse the merge specific detail (ie: not the content also available in the pull detail) from `git.mnerge`
 * @param stdOut
 */
exports.parseMergeDetail = (stdOut) => {
    return utils_1.parseStringResponse(new MergeSummary_1.MergeSummaryDetail(), parsers, stdOut);
};
//# sourceMappingURL=parse-merge.js.map

/***/ }),

/***/ 421:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
const promise_deferred_1 = __webpack_require__(819);
const git_logger_1 = __webpack_require__(178);
const logger = git_logger_1.createLogger('', 'scheduler');
const createScheduledTask = (() => {
    let id = 0;
    return () => {
        id++;
        const { promise, done } = promise_deferred_1.createDeferred();
        return {
            promise,
            done,
            id,
        };
    };
})();
class Scheduler {
    constructor(concurrency = 2) {
        this.concurrency = concurrency;
        this.pending = [];
        this.running = [];
        logger(`Constructed, concurrency=%s`, concurrency);
    }
    schedule() {
        if (!this.pending.length || this.running.length >= this.concurrency) {
            logger(`Schedule attempt ignored, pending=%s running=%s concurrency=%s`, this.pending.length, this.running.length, this.concurrency);
            return;
        }
        const task = utils_1.append(this.running, this.pending.shift());
        logger(`Attempting id=%s`, task.id);
        task.done(() => {
            logger(`Completing id=`, task.id);
            utils_1.remove(this.running, task);
            this.schedule();
        });
    }
    next() {
        const { promise, id } = utils_1.append(this.pending, createScheduledTask());
        logger(`Scheduling id=%s`, id);
        this.schedule();
        return promise;
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map

/***/ }),

/***/ 435:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const parse_push_1 = __webpack_require__(530);
const utils_1 = __webpack_require__(847);
function pushTagsTask(ref = {}, customArgs) {
    utils_1.append(customArgs, '--tags');
    return pushTask(ref, customArgs);
}
exports.pushTagsTask = pushTagsTask;
function pushTask(ref = {}, customArgs) {
    const commands = ['push', ...customArgs];
    if (ref.branch) {
        commands.splice(1, 0, ref.branch);
    }
    if (ref.remote) {
        commands.splice(1, 0, ref.remote);
    }
    utils_1.remove(commands, '-v');
    utils_1.append(commands, '--verbose');
    utils_1.append(commands, '--porcelain');
    return {
        commands,
        format: 'utf-8',
        parser: parse_push_1.parsePushResult,
    };
}
exports.pushTask = pushTask;
//# sourceMappingURL=push.js.map

/***/ }),

/***/ 444:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
const parsers = [
    new utils_1.LineParser(/^Renaming (.+) to (.+)$/, (result, [from, to]) => {
        result.moves.push({ from, to });
    }),
];
exports.parseMoveResult = function (stdOut) {
    return utils_1.parseStringResponse({ moves: [] }, parsers, stdOut);
};
//# sourceMappingURL=parse-move.js.map

/***/ }),

/***/ 446:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BranchSummaryResult {
    constructor() {
        this.all = [];
        this.branches = {};
        this.current = '';
        this.detached = false;
    }
    push(current, detached, name, commit, label) {
        if (current) {
            this.detached = detached;
            this.current = name;
        }
        this.all.push(name);
        this.branches[name] = {
            current: current,
            name: name,
            commit: commit,
            label: label
        };
    }
}
exports.BranchSummaryResult = BranchSummaryResult;
//# sourceMappingURL=BranchSummary.js.map

/***/ }),

/***/ 507:
/***/ (function(module, __unusedexports, __webpack_require__) {


module.exports = ListLogSummary;

var DiffSummary = __webpack_require__(286);

/**
 * The ListLogSummary is returned as a response to getting `git().log()` or `git().stashList()`
 *
 * @constructor
 */
function ListLogSummary (all) {
   this.all = all;
   this.latest = all.length && all[0] || null;
   this.total = all.length;
}

/**
 * Detail for each of the log lines
 * @type {ListLogLine[]}
 */
ListLogSummary.prototype.all = null;

/**
 * Most recent entry in the log
 * @type {ListLogLine}
 */
ListLogSummary.prototype.latest = null;

/**
 * Number of items in the log
 * @type {number}
 */
ListLogSummary.prototype.total = 0;

function ListLogLine (line, fields) {
   for (var k = 0; k < fields.length; k++) {
      this[fields[k]] = line[k] || '';
   }
}

/**
 * When the log was generated with a summary, the `diff` property contains as much detail
 * as was provided in the log (whether generated with `--stat` or `--shortstat`.
 * @type {DiffSummary}
 */
ListLogLine.prototype.diff = null;

ListLogSummary.START_BOUNDARY = 'òòòòòò ';

ListLogSummary.COMMIT_BOUNDARY = ' òò';

ListLogSummary.SPLITTER = ' ò ';

ListLogSummary.parse = function (text, splitter, fields) {
   fields = fields || ['hash', 'date', 'message', 'refs', 'author_name', 'author_email'];
   return new ListLogSummary(
      text
         .trim()
         .split(ListLogSummary.START_BOUNDARY)
         .filter(function(item) { return !!item.trim(); })
         .map(function (item) {
            var lineDetail = item.trim().split(ListLogSummary.COMMIT_BOUNDARY);
            var listLogLine = new ListLogLine(lineDetail[0].trim().split(splitter), fields);

            if (lineDetail.length > 1 && !!lineDetail[1].trim()) {
               listLogLine.diff = DiffSummary.parse(lineDetail[1]);
            }

            return listLogLine;
         })
   );
};


/***/ }),

/***/ 520:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const parse_move_1 = __webpack_require__(444);
const utils_1 = __webpack_require__(847);
function moveTask(from, to) {
    return {
        commands: ['mv', '-v', ...utils_1.asArray(from), to],
        format: 'utf-8',
        parser(stdOut, stdErr) {
            return parse_move_1.parseMoveResult(stdOut, stdErr);
        }
    };
}
exports.moveTask = moveTask;
//# sourceMappingURL=move.js.map

/***/ }),

/***/ 530:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
const parse_remote_messages_1 = __webpack_require__(661);
function pushResultPushedItem(local, remote, status) {
    const deleted = status.includes('deleted');
    const tag = status.includes('tag') || /^refs\/tags/.test(local);
    const alreadyUpdated = !status.includes('new');
    return {
        deleted,
        tag,
        branch: !tag,
        new: !alreadyUpdated,
        alreadyUpdated,
        local,
        remote,
    };
}
const parsers = [
    new utils_1.LineParser(/^Pushing to (.+)$/, (result, [repo]) => {
        result.repo = repo;
    }),
    new utils_1.LineParser(/^updating local tracking ref '(.+)'/, (result, [local]) => {
        result.ref = Object.assign(Object.assign({}, (result.ref || {})), { local });
    }),
    new utils_1.LineParser(/^[*-=]\s+([^:]+):(\S+)\s+\[(.+)]$/, (result, [local, remote, type]) => {
        result.pushed.push(pushResultPushedItem(local, remote, type));
    }),
    new utils_1.LineParser(/^Branch '([^']+)' set up to track remote branch '([^']+)' from '([^']+)'/, (result, [local, remote, remoteName]) => {
        result.branch = Object.assign(Object.assign({}, (result.branch || {})), { local,
            remote,
            remoteName });
    }),
    new utils_1.LineParser(/^([^:]+):(\S+)\s+([a-z0-9]+)\.\.([a-z0-9]+)$/, (result, [local, remote, from, to]) => {
        result.update = {
            head: {
                local,
                remote,
            },
            hash: {
                from,
                to,
            },
        };
    }),
];
exports.parsePushResult = (stdOut, stdErr) => {
    const pushDetail = exports.parsePushDetail(stdOut, stdErr);
    const responseDetail = parse_remote_messages_1.parseRemoteMessages(stdOut, stdErr);
    return Object.assign(Object.assign({}, pushDetail), responseDetail);
};
exports.parsePushDetail = (stdOut, stdErr) => {
    return utils_1.parseStringResponse({ pushed: [] }, parsers, `${stdOut}\n${stdErr}`);
};
//# sourceMappingURL=parse-push.js.map

/***/ }),

/***/ 536:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class LineParser {
    constructor(regExp, useMatches) {
        this.matches = [];
        this.parse = (line, target) => {
            this.resetMatches();
            if (!this._regExp.every((reg, index) => this.addMatch(reg, index, line(index)))) {
                return false;
            }
            return this.useMatches(target, this.prepareMatches()) !== false;
        };
        this._regExp = Array.isArray(regExp) ? regExp : [regExp];
        if (useMatches) {
            this.useMatches = useMatches;
        }
    }
    // @ts-ignore
    useMatches(target, match) {
        throw new Error(`LineParser:useMatches not implemented`);
    }
    resetMatches() {
        this.matches.length = 0;
    }
    prepareMatches() {
        return this.matches;
    }
    addMatch(reg, index, line) {
        const matched = line && reg.exec(line);
        if (matched) {
            this.pushMatch(index, matched);
        }
        return !!matched;
    }
    pushMatch(_index, matched) {
        this.matches.push(...matched.slice(1));
    }
}
exports.LineParser = LineParser;
class RemoteLineParser extends LineParser {
    addMatch(reg, index, line) {
        return /^remote:\s/.test(String(line)) && super.addMatch(reg, index, line);
    }
    pushMatch(index, matched) {
        if (index > 0 || matched.length > 1) {
            super.pushMatch(index, matched);
        }
    }
}
exports.RemoteLineParser = RemoteLineParser;
//# sourceMappingURL=line-parser.js.map

/***/ }),

/***/ 539:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class TagList {
    constructor(all, latest) {
        this.all = all;
        this.latest = latest;
    }
}
exports.TagList = TagList;
exports.parseTagList = function (data, customSort = false) {
    const tags = data
        .split('\n')
        .map(trimmed)
        .filter(Boolean);
    if (!customSort) {
        tags.sort(function (tagA, tagB) {
            const partsA = tagA.split('.');
            const partsB = tagB.split('.');
            if (partsA.length === 1 || partsB.length === 1) {
                return singleSorted(toNumber(partsA[0]), toNumber(partsB[0]));
            }
            for (let i = 0, l = Math.max(partsA.length, partsB.length); i < l; i++) {
                const diff = sorted(toNumber(partsA[i]), toNumber(partsB[i]));
                if (diff) {
                    return diff;
                }
            }
            return 0;
        });
    }
    const latest = customSort ? tags[0] : [...tags].reverse().find((tag) => tag.indexOf('.') >= 0);
    return new TagList(tags, latest);
};
function singleSorted(a, b) {
    const aIsNum = isNaN(a);
    const bIsNum = isNaN(b);
    if (aIsNum !== bIsNum) {
        return aIsNum ? 1 : -1;
    }
    return aIsNum ? sorted(a, b) : 0;
}
function sorted(a, b) {
    return a === b ? 0 : a > b ? 1 : -1;
}
function trimmed(input) {
    return input.trim();
}
function toNumber(input) {
    if (typeof input === 'string') {
        return parseInt(input.replace(/^\D+/g, ''), 10) || 0;
    }
    return 0;
}
//# sourceMappingURL=TagList.js.map

/***/ }),

/***/ 540:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const TagList_1 = __webpack_require__(539);
/**
 * Task used by `git.tags`
 */
function tagListTask(customArgs = []) {
    const hasCustomSort = customArgs.some((option) => /^--sort=/.test(option));
    return {
        format: 'utf-8',
        commands: ['tag', '-l', ...customArgs],
        parser(text) {
            return TagList_1.parseTagList(text, hasCustomSort);
        },
    };
}
exports.tagListTask = tagListTask;
/**
 * Task used by `git.addTag`
 */
function addTagTask(name) {
    return {
        format: 'utf-8',
        commands: ['tag', name],
        parser() {
            return { name };
        }
    };
}
exports.addTagTask = addTagTask;
/**
 * Task used by `git.addTag`
 */
function addAnnotatedTagTask(name, tagMessage) {
    return {
        format: 'utf-8',
        commands: ['tag', '-a', '-m', tagMessage, name],
        parser() {
            return { name };
        }
    };
}
exports.addAnnotatedTagTask = addAnnotatedTagTask;
//# sourceMappingURL=tag.js.map

/***/ }),

/***/ 543:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __webpack_require__(129);
const api_1 = __webpack_require__(732);
const task_1 = __webpack_require__(815);
const tasks_pending_queue_1 = __webpack_require__(676);
const utils_1 = __webpack_require__(847);
class GitExecutorChain {
    constructor(_executor, _scheduler) {
        this._executor = _executor;
        this._scheduler = _scheduler;
        this._chain = Promise.resolve();
        this._queue = new tasks_pending_queue_1.TasksPendingQueue();
    }
    get binary() {
        return this._executor.binary;
    }
    get outputHandler() {
        return this._executor.outputHandler;
    }
    get cwd() {
        return this._executor.cwd;
    }
    get env() {
        return this._executor.env;
    }
    push(task) {
        this._queue.push(task);
        return this._chain = this._chain.then(() => this.attemptTask(task));
    }
    attemptTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const onScheduleComplete = yield this._scheduler.next();
            const onQueueComplete = () => this._queue.complete(task);
            try {
                const { logger } = this._queue.attempt(task);
                return yield (task_1.isEmptyTask(task)
                    ? this.attemptEmptyTask(task, logger)
                    : this.attemptRemoteTask(task, logger));
            }
            catch (e) {
                throw this.onFatalException(task, e);
            }
            finally {
                onQueueComplete();
                onScheduleComplete();
            }
        });
    }
    onFatalException(task, e) {
        const gitError = (e instanceof api_1.GitError) ? Object.assign(e, { task }) : new api_1.GitError(task, e && String(e));
        this._chain = Promise.resolve();
        this._queue.fatal(gitError);
        return gitError;
    }
    attemptRemoteTask(task, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const raw = yield this.gitResponse(this.binary, task.commands, this.outputHandler, logger.step('SPAWN'));
            const outputStreams = yield this.handleTaskData(task, raw, logger.step('HANDLE'));
            logger(`passing response to task's parser as a %s`, task.format);
            if (task_1.isBufferTask(task)) {
                return utils_1.callTaskParser(task.parser, outputStreams);
            }
            return utils_1.callTaskParser(task.parser, outputStreams.asStrings());
        });
    }
    attemptEmptyTask(task, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`empty task bypassing child process to call to task's parser`);
            return task.parser();
        });
    }
    handleTaskData({ onError, concatStdErr }, { exitCode, stdOut, stdErr }, logger) {
        return new Promise((done, fail) => {
            logger(`Preparing to handle process response exitCode=%d stdOut=`, exitCode);
            if (exitCode && stdErr.length && onError) {
                logger.info(`exitCode=%s handling with custom error handler`);
                logger(`concatenate stdErr to stdOut: %j`, concatStdErr);
                return onError(exitCode, Buffer.concat([...(concatStdErr ? stdOut : []), ...stdErr]).toString('utf-8'), (result) => {
                    logger.info(`custom error handler treated as success`);
                    logger(`custom error returned a %s`, utils_1.objectToString(result));
                    done(new utils_1.GitOutputStreams(Buffer.isBuffer(result) ? result : Buffer.from(String(result)), Buffer.concat(stdErr)));
                }, fail);
            }
            if (exitCode && stdErr.length) {
                logger.info(`exitCode=%s treated as error when then child process has written to stdErr`);
                return fail(Buffer.concat(stdErr).toString('utf-8'));
            }
            if (concatStdErr) {
                logger(`concatenating stdErr onto stdOut before processing`);
                logger(`stdErr: $O`, stdErr);
                stdOut.push(...stdErr);
            }
            logger.info(`retrieving task output complete`);
            done(new utils_1.GitOutputStreams(Buffer.concat(stdOut), Buffer.concat(stdErr)));
        });
    }
    gitResponse(command, args, outputHandler, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const outputLogger = logger.sibling('output');
            const spawnOptions = {
                cwd: this.cwd,
                env: this.env,
                windowsHide: true,
            };
            return new Promise((done) => {
                const stdOut = [];
                const stdErr = [];
                let attempted = false;
                function attemptClose(exitCode, event = 'retry') {
                    // closing when there is content, terminate immediately
                    if (attempted || stdErr.length || stdOut.length) {
                        logger.info(`exitCode=%s event=%s`, exitCode, event);
                        done({
                            stdOut,
                            stdErr,
                            exitCode,
                        });
                        attempted = true;
                        outputLogger.destroy();
                    }
                    // first attempt at closing but no content yet, wait briefly for the close/exit that may follow
                    if (!attempted) {
                        attempted = true;
                        setTimeout(() => attemptClose(exitCode, 'deferred'), 50);
                        logger('received %s event before content on stdOut/stdErr', event);
                    }
                }
                logger.info(`%s %o`, command, args);
                logger('%O', spawnOptions);
                const spawned = child_process_1.spawn(command, args, spawnOptions);
                spawned.stdout.on('data', onDataReceived(stdOut, 'stdOut', logger, outputLogger.step('stdOut')));
                spawned.stderr.on('data', onDataReceived(stdErr, 'stdErr', logger, outputLogger.step('stdErr')));
                spawned.on('error', onErrorReceived(stdErr, logger));
                spawned.on('close', (code) => attemptClose(code, 'close'));
                spawned.on('exit', (code) => attemptClose(code, 'exit'));
                if (outputHandler) {
                    logger(`Passing child process stdOut/stdErr to custom outputHandler`);
                    outputHandler(command, spawned.stdout, spawned.stderr, [...args]);
                }
            });
        });
    }
}
exports.GitExecutorChain = GitExecutorChain;
function onErrorReceived(target, logger) {
    return (err) => {
        logger(`[ERROR] child process exception %o`, err);
        target.push(Buffer.from(String(err.stack), 'ascii'));
    };
}
function onDataReceived(target, name, logger, output) {
    return (buffer) => {
        logger(`%s received %L bytes`, name, buffer);
        output(`%B`, buffer);
        target.push(buffer);
    };
}
//# sourceMappingURL=git-executor-chain.js.map

/***/ }),

/***/ 565:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
function objectEnumerationResult(remoteMessages) {
    return (remoteMessages.objects = remoteMessages.objects || {
        compressing: 0,
        counting: 0,
        enumerating: 0,
        packReused: 0,
        reused: { count: 0, delta: 0 },
        total: { count: 0, delta: 0 }
    });
}
function asObjectCount(source) {
    const count = /^\s*(\d+)/.exec(source);
    const delta = /delta (\d+)/i.exec(source);
    return {
        count: utils_1.asNumber(count && count[1] || '0'),
        delta: utils_1.asNumber(delta && delta[1] || '0'),
    };
}
exports.remoteMessagesObjectParsers = [
    new utils_1.RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: (\d+),/i, (result, [action, count]) => {
        const key = action.toLowerCase();
        const enumeration = objectEnumerationResult(result.remoteMessages);
        Object.assign(enumeration, { [key]: utils_1.asNumber(count) });
    }),
    new utils_1.RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: \d+% \(\d+\/(\d+)\),/i, (result, [action, count]) => {
        const key = action.toLowerCase();
        const enumeration = objectEnumerationResult(result.remoteMessages);
        Object.assign(enumeration, { [key]: utils_1.asNumber(count) });
    }),
    new utils_1.RemoteLineParser(/total ([^,]+), reused ([^,]+), pack-reused (\d+)/i, (result, [total, reused, packReused]) => {
        const objects = objectEnumerationResult(result.remoteMessages);
        objects.total = asObjectCount(total);
        objects.reused = asObjectCount(reused);
        objects.packReused = utils_1.asNumber(packReused);
    }),
];
//# sourceMappingURL=parse-remote-objects.js.map

/***/ }),

/***/ 567:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class PullSummary {
    constructor() {
        this.remoteMessages = {
            all: [],
        };
        this.created = [];
        this.deleted = [];
        this.files = [];
        this.deletions = {};
        this.insertions = {};
        this.summary = {
            changes: 0,
            deletions: 0,
            insertions: 0,
        };
    }
}
exports.PullSummary = PullSummary;
//# sourceMappingURL=PullSummary.js.map

/***/ }),

/***/ 577:
/***/ (function(module, __unusedexports, __webpack_require__) {


const {esModuleFactory, gitExportFactory} = __webpack_require__(949);
const {gitP} = __webpack_require__(941);

module.exports = esModuleFactory(
   gitExportFactory(gitP)
);


/***/ }),

/***/ 578:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class GitOutputStreams {
    constructor(stdOut, stdErr) {
        this.stdOut = stdOut;
        this.stdErr = stdErr;
    }
    asStrings() {
        return new GitOutputStreams(this.stdOut.toString('utf8'), this.stdErr.toString('utf8'));
    }
}
exports.GitOutputStreams = GitOutputStreams;
//# sourceMappingURL=git-output-streams.js.map

/***/ }),

/***/ 597:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ConfigList_1 = __webpack_require__(219);
function addConfigTask(key, value, append = false) {
    const commands = ['config', '--local'];
    if (append) {
        commands.push('--add');
    }
    commands.push(key, value);
    return {
        commands,
        format: 'utf-8',
        parser(text) {
            return text;
        }
    };
}
exports.addConfigTask = addConfigTask;
function listConfigTask() {
    return {
        commands: ['config', '--list', '--show-origin', '--null'],
        format: 'utf-8',
        parser(text) {
            return ConfigList_1.configListParser(text);
        },
    };
}
exports.listConfigTask = listConfigTask;
//# sourceMappingURL=config.js.map

/***/ }),

/***/ 621:
/***/ (function(module) {

"use strict";

module.exports = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 636:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const parse_pull_1 = __webpack_require__(658);
function pullTask(remote, branch, customArgs) {
    const commands = ['pull', ...customArgs];
    if (remote && branch) {
        commands.splice(1, 0, remote, branch);
    }
    return {
        commands,
        format: 'utf-8',
        parser(stdOut, stdErr) {
            return parse_pull_1.parsePullResult(stdOut, stdErr);
        }
    };
}
exports.pullTask = pullTask;
//# sourceMappingURL=pull.js.map

/***/ }),

/***/ 651:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class MergeSummaryConflict {
    constructor(reason, file = null, meta) {
        this.reason = reason;
        this.file = file;
        this.meta = meta;
    }
    toString() {
        return `${this.file}:${this.reason}`;
    }
}
exports.MergeSummaryConflict = MergeSummaryConflict;
class MergeSummaryDetail {
    constructor() {
        this.conflicts = [];
        this.merges = [];
        this.result = 'success';
    }
    get failed() {
        return this.conflicts.length > 0;
    }
    get reason() {
        return this.result;
    }
    toString() {
        if (this.conflicts.length) {
            return `CONFLICTS: ${this.conflicts.join(', ')}`;
        }
        return 'OK';
    }
}
exports.MergeSummaryDetail = MergeSummaryDetail;
//# sourceMappingURL=MergeSummary.js.map

/***/ }),

/***/ 658:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const PullSummary_1 = __webpack_require__(567);
const utils_1 = __webpack_require__(847);
const parse_remote_messages_1 = __webpack_require__(661);
const FILE_UPDATE_REGEX = /^\s*(.+?)\s+\|\s+\d+\s*(\+*)(-*)/;
const SUMMARY_REGEX = /(\d+)\D+((\d+)\D+\(\+\))?(\D+(\d+)\D+\(-\))?/;
const ACTION_REGEX = /^(create|delete) mode \d+ (.+)/;
const parsers = [
    new utils_1.LineParser(FILE_UPDATE_REGEX, (result, [file, insertions, deletions]) => {
        result.files.push(file);
        if (insertions) {
            result.insertions[file] = insertions.length;
        }
        if (deletions) {
            result.deletions[file] = deletions.length;
        }
    }),
    new utils_1.LineParser(SUMMARY_REGEX, (result, [changes, , insertions, , deletions]) => {
        if (insertions !== undefined || deletions !== undefined) {
            result.summary.changes = +changes || 0;
            result.summary.insertions = +insertions || 0;
            result.summary.deletions = +deletions || 0;
            return true;
        }
        return false;
    }),
    new utils_1.LineParser(ACTION_REGEX, (result, [action, file]) => {
        utils_1.append(result.files, file);
        utils_1.append((action === 'create') ? result.created : result.deleted, file);
    }),
];
exports.parsePullDetail = (stdOut, stdErr) => {
    return utils_1.parseStringResponse(new PullSummary_1.PullSummary(), parsers, `${stdOut}\n${stdErr}`);
};
exports.parsePullResult = (stdOut, stdErr) => {
    return Object.assign(new PullSummary_1.PullSummary(), exports.parsePullDetail(stdOut, stdErr), parse_remote_messages_1.parseRemoteMessages(stdOut, stdErr));
};
//# sourceMappingURL=parse-pull.js.map

/***/ }),

/***/ 661:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
const parse_remote_objects_1 = __webpack_require__(565);
const parsers = [
    new utils_1.RemoteLineParser(/^remote:\s*(.+)$/, (result, [text]) => {
        result.remoteMessages.all.push(text.trim());
        return false;
    }),
    ...parse_remote_objects_1.remoteMessagesObjectParsers,
    new utils_1.RemoteLineParser([/create a (?:pull|merge) request/i, /\s(https?:\/\/\S+)$/], (result, [pullRequestUrl]) => {
        result.remoteMessages.pullRequestUrl = pullRequestUrl;
    }),
    new utils_1.RemoteLineParser([/found (\d+) vulnerabilities.+\(([^)]+)\)/i, /\s(https?:\/\/\S+)$/], (result, [count, summary, url]) => {
        result.remoteMessages.vulnerabilities = {
            count: utils_1.asNumber(count),
            summary,
            url,
        };
    }),
];
function parseRemoteMessages(_stdOut, stdErr) {
    return utils_1.parseStringResponse({ remoteMessages: new RemoteMessageSummary() }, parsers, stdErr);
}
exports.parseRemoteMessages = parseRemoteMessages;
class RemoteMessageSummary {
    constructor() {
        this.all = [];
    }
}
exports.RemoteMessageSummary = RemoteMessageSummary;
//# sourceMappingURL=parse-remote-messages.js.map

/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 676:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const git_logger_1 = __webpack_require__(178);
const api_1 = __webpack_require__(732);
class TasksPendingQueue {
    constructor(logLabel = 'GitExecutor') {
        this.logLabel = logLabel;
        this._queue = new Map();
    }
    withProgress(task) {
        return this._queue.get(task);
    }
    createProgress(task) {
        const name = TasksPendingQueue.getName(task.commands[0]);
        const logger = git_logger_1.createLogger(this.logLabel, name);
        return {
            task,
            logger,
            name,
        };
    }
    push(task) {
        const progress = this.createProgress(task);
        progress.logger('Adding task to the queue, commands = %o', task.commands);
        this._queue.set(task, progress);
        return progress;
    }
    fatal(err) {
        for (const [task, { logger }] of Array.from(this._queue.entries())) {
            if (task === err.task) {
                logger.info(`Failed %o`, err);
                logger(`Fatal exception, any as-yet un-started tasks run through this executor will not be attempted`);
            }
            else {
                logger.info(`A fatal exception occurred in a previous task, the queue has been purged: %o`, err.message);
            }
            this.complete(task);
        }
        if (this._queue.size !== 0) {
            throw new Error(`Queue size should be zero after fatal: ${this._queue.size}`);
        }
    }
    complete(task) {
        const progress = this.withProgress(task);
        if (progress) {
            progress.logger.destroy();
            this._queue.delete(task);
        }
    }
    attempt(task) {
        const progress = this.withProgress(task);
        if (!progress) {
            throw new api_1.GitError(undefined, 'TasksPendingQueue: attempt called for an unknown task');
        }
        progress.logger('Starting task');
        return progress;
    }
    static getName(name = 'empty') {
        return `task:${name}:${++TasksPendingQueue.counter}`;
    }
}
exports.TasksPendingQueue = TasksPendingQueue;
TasksPendingQueue.counter = 0;
//# sourceMappingURL=tasks-pending-queue.js.map

/***/ }),

/***/ 689:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
class CleanResponse {
    constructor(dryRun) {
        this.dryRun = dryRun;
        this.paths = [];
        this.files = [];
        this.folders = [];
    }
}
exports.CleanResponse = CleanResponse;
const removalRegexp = /^[a-z]+\s*/i;
const dryRunRemovalRegexp = /^[a-z]+\s+[a-z]+\s*/i;
const isFolderRegexp = /\/$/;
function cleanSummaryParser(dryRun, text) {
    const summary = new CleanResponse(dryRun);
    const regexp = dryRun ? dryRunRemovalRegexp : removalRegexp;
    utils_1.toLinesWithContent(text).forEach(line => {
        const removed = line.replace(regexp, '');
        summary.paths.push(removed);
        (isFolderRegexp.test(removed) ? summary.folders : summary.files).push(removed);
    });
    return summary;
}
exports.cleanSummaryParser = cleanSummaryParser;
//# sourceMappingURL=CleanSummary.js.map

/***/ }),

/***/ 690:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class InitSummary {
    constructor(bare, path, existing, gitDir) {
        this.bare = bare;
        this.path = path;
        this.existing = existing;
        this.gitDir = gitDir;
    }
}
exports.InitSummary = InitSummary;
const initResponseRegex = /^Init.+ repository in (.+)$/;
const reInitResponseRegex = /^Rein.+ in (.+)$/;
function parseInit(bare, path, text) {
    const response = String(text).trim();
    let result;
    if ((result = initResponseRegex.exec(response))) {
        return new InitSummary(bare, path, false, result[1]);
    }
    if ((result = reInitResponseRegex.exec(response))) {
        return new InitSummary(bare, path, true, result[1]);
    }
    let gitDir = '';
    const tokens = response.split(' ');
    while (tokens.length) {
        const token = tokens.shift();
        if (token === 'in') {
            gitDir = tokens.join(' ');
            break;
        }
    }
    return new InitSummary(bare, path, /^re/i.test(response), gitDir);
}
exports.parseInit = parseInit;
//# sourceMappingURL=InitSummary.js.map

/***/ }),

/***/ 701:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const git_executor_chain_1 = __webpack_require__(543);
class GitExecutor {
    constructor(binary = 'git', cwd, _scheduler) {
        this.binary = binary;
        this.cwd = cwd;
        this._scheduler = _scheduler;
        this._chain = new git_executor_chain_1.GitExecutorChain(this, this._scheduler);
    }
    chain() {
        return new git_executor_chain_1.GitExecutorChain(this, this._scheduler);
    }
    push(task) {
        return this._chain.push(task);
    }
}
exports.GitExecutor = GitExecutor;
//# sourceMappingURL=git-executor.js.map

/***/ }),

/***/ 732:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var clean_1 = __webpack_require__(386);
exports.CleanOptions = clean_1.CleanOptions;
var check_is_repo_1 = __webpack_require__(221);
exports.CheckRepoActions = check_is_repo_1.CheckRepoActions;
var reset_1 = __webpack_require__(377);
exports.ResetMode = reset_1.ResetMode;
var git_construct_error_1 = __webpack_require__(876);
exports.GitConstructError = git_construct_error_1.GitConstructError;
var git_error_1 = __webpack_require__(757);
exports.GitError = git_error_1.GitError;
var git_response_error_1 = __webpack_require__(131);
exports.GitResponseError = git_response_error_1.GitResponseError;
var task_configuration_error_1 = __webpack_require__(740);
exports.TaskConfigurationError = task_configuration_error_1.TaskConfigurationError;
//# sourceMappingURL=api.js.map

/***/ }),

/***/ 740:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const git_error_1 = __webpack_require__(757);
/**
 * The `TaskConfigurationError` is thrown when a command was incorrectly
 * configured. An error of this kind means that no attempt was made to
 * run your command through the underlying `git` binary.
 *
 * Check the `.message` property for more detail on why your configuration
 * resulted in an error.
 */
class TaskConfigurationError extends git_error_1.GitError {
    constructor(message) {
        super(undefined, message);
    }
}
exports.TaskConfigurationError = TaskConfigurationError;
//# sourceMappingURL=task-configuration-error.js.map

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 751:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(825));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 755:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BranchDeletionBatch {
    constructor() {
        this.all = [];
        this.branches = {};
        this.errors = [];
    }
    get success() {
        return !this.errors.length;
    }
}
exports.BranchDeletionBatch = BranchDeletionBatch;
function branchDeletionSuccess(branch, hash) {
    return {
        branch, hash, success: true,
    };
}
exports.branchDeletionSuccess = branchDeletionSuccess;
function branchDeletionFailure(branch) {
    return {
        branch, hash: null, success: false,
    };
}
exports.branchDeletionFailure = branchDeletionFailure;
function isSingleBranchDeleteFailure(test) {
    return test.success;
}
exports.isSingleBranchDeleteFailure = isSingleBranchDeleteFailure;
//# sourceMappingURL=BranchDeleteSummary.js.map

/***/ }),

/***/ 757:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The `GitError` is thrown when the underlying `git` process throws a
 * fatal exception (eg an `ENOENT` exception when attempting to use a
 * non-writable directory as the root for your repo), and acts as the
 * base class for more specific errors thrown by the parsing of the
 * git response or errors in the configuration of the task about to
 * be run.
 *
 * When an exception is thrown, pending tasks in the same instance will
 * not be executed. The recommended way to run a series of tasks that
 * can independently fail without needing to prevent future tasks from
 * running is to catch them individually:
 *
 * ```typescript
 import { gitP, SimpleGit, GitError, PullResult } from 'simple-git';

 function catchTask (e: GitError) {
   return e.
 }

 const git = gitP(repoWorkingDir);
 const pulled: PullResult | GitError = await git.pull().catch(catchTask);
 const pushed: string | GitError = await git.pushTags().catch(catchTask);
 ```
 */
class GitError extends Error {
    constructor(task, message) {
        super(message);
        this.task = task;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.GitError = GitError;
//# sourceMappingURL=git-error.js.map

/***/ }),

/***/ 772:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = __webpack_require__(815);
function addSubModuleTask(repo, path) {
    return subModuleTask(['add', repo, path]);
}
exports.addSubModuleTask = addSubModuleTask;
function initSubModuleTask(customArgs) {
    return subModuleTask(['init', ...customArgs]);
}
exports.initSubModuleTask = initSubModuleTask;
function subModuleTask(customArgs) {
    const commands = [...customArgs];
    if (commands[0] !== 'submodule') {
        commands.unshift('submodule');
    }
    return task_1.straightThroughStringTask(commands);
}
exports.subModuleTask = subModuleTask;
function updateSubModuleTask(customArgs) {
    return subModuleTask(['update', ...customArgs]);
}
exports.updateSubModuleTask = updateSubModuleTask;
//# sourceMappingURL=sub-module.js.map

/***/ }),

/***/ 790:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const FileStatusSummary_1 = __webpack_require__(860);
/**
 * The StatusSummary is returned as a response to getting `git().status()`
 */
class StatusSummary {
    constructor() {
        this.not_added = [];
        this.conflicted = [];
        this.created = [];
        this.deleted = [];
        this.modified = [];
        this.renamed = [];
        /**
         * All files represented as an array of objects containing the `path` and status in `index` and
         * in the `working_dir`.
         */
        this.files = [];
        this.staged = [];
        /**
         * Number of commits ahead of the tracked branch
         */
        this.ahead = 0;
        /**
         *Number of commits behind the tracked branch
         */
        this.behind = 0;
        /**
         * Name of the current branch
         */
        this.current = null;
        /**
         * Name of the branch being tracked
         */
        this.tracking = null;
    }
    /**
     * Gets whether this StatusSummary represents a clean working branch.
     */
    isClean() {
        return !this.files.length;
    }
}
exports.StatusSummary = StatusSummary;
exports.StatusSummaryParsers = {
    '##': function (line, status) {
        const aheadReg = /ahead (\d+)/;
        const behindReg = /behind (\d+)/;
        const currentReg = /^(.+?(?=(?:\.{3}|\s|$)))/;
        const trackingReg = /\.{3}(\S*)/;
        const onEmptyBranchReg = /\son\s([\S]+)$/;
        let regexResult;
        regexResult = aheadReg.exec(line);
        status.ahead = regexResult && +regexResult[1] || 0;
        regexResult = behindReg.exec(line);
        status.behind = regexResult && +regexResult[1] || 0;
        regexResult = currentReg.exec(line);
        status.current = regexResult && regexResult[1];
        regexResult = trackingReg.exec(line);
        status.tracking = regexResult && regexResult[1];
        regexResult = onEmptyBranchReg.exec(line);
        status.current = regexResult && regexResult[1] || status.current;
    },
    '??': function (line, status) {
        status.not_added.push(line);
    },
    A: function (line, status) {
        status.created.push(line);
    },
    AM: function (line, status) {
        status.created.push(line);
    },
    D: function (line, status) {
        status.deleted.push(line);
    },
    M: function (line, status, indexState) {
        status.modified.push(line);
        if (indexState === 'M') {
            status.staged.push(line);
        }
    },
    R: function (line, status) {
        const detail = /^(.+) -> (.+)$/.exec(line) || [null, line, line];
        status.renamed.push({
            from: String(detail[1]),
            to: String(detail[2])
        });
    },
    UU: function (line, status) {
        status.conflicted.push(line);
    }
};
exports.StatusSummaryParsers.MM = exports.StatusSummaryParsers.M;
/* Map all unmerged status code combinations to UU to mark as conflicted */
exports.StatusSummaryParsers.AA = exports.StatusSummaryParsers.UU;
exports.StatusSummaryParsers.UD = exports.StatusSummaryParsers.UU;
exports.StatusSummaryParsers.DU = exports.StatusSummaryParsers.UU;
exports.StatusSummaryParsers.DD = exports.StatusSummaryParsers.UU;
exports.StatusSummaryParsers.AU = exports.StatusSummaryParsers.UU;
exports.StatusSummaryParsers.UA = exports.StatusSummaryParsers.UU;
exports.parseStatusSummary = function (text) {
    let file;
    const lines = text.trim().split('\n');
    const status = new StatusSummary();
    for (let i = 0, l = lines.length; i < l; i++) {
        file = splitLine(lines[i]);
        if (!file) {
            continue;
        }
        if (file.handler) {
            file.handler(file.path, status, file.index, file.workingDir);
        }
        if (file.code !== '##') {
            status.files.push(new FileStatusSummary_1.FileStatusSummary(file.path, file.index, file.workingDir));
        }
    }
    return status;
};
function splitLine(lineStr) {
    let line = lineStr.trim().match(/(..?)(\s+)(.*)/);
    if (!line || !line[1].trim()) {
        line = lineStr.trim().match(/(..?)\s+(.*)/);
    }
    if (!line) {
        return;
    }
    let code = line[1];
    if (line[2].length > 1) {
        code += ' ';
    }
    if (code.length === 1 && line[2].length === 1) {
        code = ' ' + code;
    }
    return {
        raw: code,
        code: code.trim(),
        index: code.charAt(0),
        workingDir: code.charAt(1),
        handler: exports.StatusSummaryParsers[code.trim()],
        path: line[3]
    };
}
//# sourceMappingURL=StatusSummary.js.map

/***/ }),

/***/ 815:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const task_configuration_error_1 = __webpack_require__(740);
exports.EMPTY_COMMANDS = [];
function adhocExecTask(parser) {
    return {
        commands: exports.EMPTY_COMMANDS,
        format: 'utf-8',
        parser,
    };
}
exports.adhocExecTask = adhocExecTask;
function configurationErrorTask(error) {
    return {
        commands: exports.EMPTY_COMMANDS,
        format: 'utf-8',
        parser() {
            throw typeof error === 'string' ? new task_configuration_error_1.TaskConfigurationError(error) : error;
        }
    };
}
exports.configurationErrorTask = configurationErrorTask;
function straightThroughStringTask(commands, trimmed = false) {
    return {
        commands,
        format: 'utf-8',
        parser(text) {
            return trimmed ? String(text).trim() : text;
        },
    };
}
exports.straightThroughStringTask = straightThroughStringTask;
function isBufferTask(task) {
    return task.format === 'buffer';
}
exports.isBufferTask = isBufferTask;
function isEmptyTask(task) {
    return !task.commands.length;
}
exports.isEmptyTask = isEmptyTask;
//# sourceMappingURL=task.js.map

/***/ }),

/***/ 819:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeferred = exports.deferred = void 0;
/**
 * Creates a new `DeferredPromise`
 *
 * ```typescript
 import {deferred} from '@kwsites/promise-deferred`;
 ```
 */
function deferred() {
    let done;
    let fail;
    let status = 'pending';
    const promise = new Promise((_done, _fail) => {
        done = _done;
        fail = _fail;
    });
    return {
        promise,
        done(result) {
            if (status === 'pending') {
                status = 'resolved';
                done(result);
            }
        },
        fail(error) {
            if (status === 'pending') {
                status = 'rejected';
                fail(error);
            }
        },
        get fulfilled() {
            return status !== 'pending';
        },
        get status() {
            return status;
        },
    };
}
exports.deferred = deferred;
/**
 * Alias of the exported `deferred` function, to help consumers wanting to use `deferred` as the
 * local variable name rather than the factory import name, without needing to rename on import.
 *
 * ```typescript
 import {createDeferred} from '@kwsites/promise-deferred`;
 ```
 */
exports.createDeferred = deferred;
/**
 * Default export allows use as:
 *
 * ```typescript
 import deferred from '@kwsites/promise-deferred`;
 ```
 */
exports.default = deferred;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 825:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __webpack_require__(747);
const debug_1 = __importDefault(__webpack_require__(231));
const log = debug_1.default('@kwsites/file-exists');
function check(path, isFile, isDirectory) {
    log(`checking %s`, path);
    try {
        const stat = fs_1.statSync(path);
        if (stat.isFile() && isFile) {
            log(`[OK] path represents a file`);
            return true;
        }
        if (stat.isDirectory() && isDirectory) {
            log(`[OK] path represents a directory`);
            return true;
        }
        log(`[FAIL] path represents something other than a file or directory`);
        return false;
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            log(`[FAIL] path is not accessible: %o`, e);
            return false;
        }
        log(`[FATAL] %o`, e);
        throw e;
    }
}
/**
 * Synchronous validation of a path existing either as a file or as a directory.
 *
 * @param {string} path The path to check
 * @param {number} type One or both of the exported numeric constants
 */
function exists(path, type = exports.READABLE) {
    return check(path, (type & exports.FILE) > 0, (type & exports.FOLDER) > 0);
}
exports.exists = exists;
/**
 * Constant representing a file
 */
exports.FILE = 1;
/**
 * Constant representing a folder
 */
exports.FOLDER = 2;
/**
 * Constant representing either a file or a folder
 */
exports.READABLE = exports.FILE + exports.FOLDER;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 829:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(732);
const parse_merge_1 = __webpack_require__(412);
const task_1 = __webpack_require__(815);
function mergeTask(customArgs) {
    if (!customArgs.length) {
        return task_1.configurationErrorTask('Git.merge requires at least one option');
    }
    return {
        commands: ['merge', ...customArgs],
        format: 'utf-8',
        parser(stdOut, stdErr) {
            const merge = parse_merge_1.parseMergeResult(stdOut, stdErr);
            if (merge.failed) {
                throw new api_1.GitResponseError(merge);
            }
            return merge;
        }
    };
}
exports.mergeTask = mergeTask;
//# sourceMappingURL=merge.js.map

/***/ }),

/***/ 847:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(366));
__export(__webpack_require__(185));
__export(__webpack_require__(578));
__export(__webpack_require__(536));
__export(__webpack_require__(218));
__export(__webpack_require__(368));
__export(__webpack_require__(237));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 850:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(732);
const utils_1 = __webpack_require__(847);
function taskCallback(task, response, callback = utils_1.NOOP) {
    const onSuccess = (data) => {
        callback(null, data);
    };
    const onError = (err) => {
        if ((err === null || err === void 0 ? void 0 : err.task) === task) {
            if (err instanceof api_1.GitResponseError) {
                return callback(addDeprecationNoticeToError(err));
            }
            callback(err);
        }
    };
    response.then(onSuccess, onError);
}
exports.taskCallback = taskCallback;
function addDeprecationNoticeToError(err) {
    let log = (name) => {
        console.warn(`simple-git deprecation notice: accessing GitResponseError.${name} should be GitResponseError.git.${name}`);
        log = utils_1.NOOP;
    };
    return Object.create(err, Object.getOwnPropertyNames(err.git).reduce(descriptorReducer, {}));
    function descriptorReducer(all, name) {
        if (name in err) {
            return all;
        }
        all[name] = {
            enumerable: false,
            configurable: false,
            get() {
                log(name);
                return err.git[name];
            },
        };
        return all;
    }
}
//# sourceMappingURL=task-callback.js.map

/***/ }),

/***/ 860:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.fromPathRegex = /^(.+) -> (.+)$/;
class FileStatusSummary {
    constructor(path, index, working_dir) {
        this.path = path;
        this.index = index;
        this.working_dir = working_dir;
        if ('R' === (index + working_dir)) {
            const detail = exports.fromPathRegex.exec(path) || [null, path, path];
            this.from = detail[1] || '';
            this.path = detail[2] || '';
        }
    }
}
exports.FileStatusSummary = FileStatusSummary;
//# sourceMappingURL=FileStatusSummary.js.map

/***/ }),

/***/ 866:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = __webpack_require__(815);
const GetRemoteSummary_1 = __webpack_require__(999);
function addRemoteTask(remoteName, remoteRepo, customArgs = []) {
    return task_1.straightThroughStringTask(['remote', 'add', ...customArgs, remoteName, remoteRepo]);
}
exports.addRemoteTask = addRemoteTask;
function getRemotesTask(verbose) {
    const commands = ['remote'];
    if (verbose) {
        commands.push('-v');
    }
    return {
        commands,
        format: 'utf-8',
        parser: verbose ? GetRemoteSummary_1.parseGetRemotesVerbose : GetRemoteSummary_1.parseGetRemotes,
    };
}
exports.getRemotesTask = getRemotesTask;
function listRemotesTask(customArgs = []) {
    const commands = [...customArgs];
    if (commands[0] !== 'ls-remote') {
        commands.unshift('ls-remote');
    }
    return task_1.straightThroughStringTask(commands);
}
exports.listRemotesTask = listRemotesTask;
function remoteTask(customArgs = []) {
    const commands = [...customArgs];
    if (commands[0] !== 'remote') {
        commands.unshift('remote');
    }
    return task_1.straightThroughStringTask(commands);
}
exports.remoteTask = remoteTask;
function removeRemoteTask(remoteName) {
    return task_1.straightThroughStringTask(['remote', 'remove', remoteName]);
}
exports.removeRemoteTask = removeRemoteTask;
//# sourceMappingURL=remote.js.map

/***/ }),

/***/ 867:
/***/ (function(module) {

module.exports = require("tty");

/***/ }),

/***/ 876:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const git_error_1 = __webpack_require__(757);
/**
 * The `GitConstructError` is thrown when an error occurs in the constructor
 * of the `simple-git` instance itself. Most commonly as a result of using
 * a `baseDir` option that points to a folder that either does not exist,
 * or cannot be read by the user the node script is running as.
 *
 * Check the `.message` property for more detail including the properties
 * passed to the constructor.
 */
class GitConstructError extends git_error_1.GitError {
    constructor(config, message) {
        super(undefined, message);
        this.config = config;
    }
}
exports.GitConstructError = GitConstructError;
//# sourceMappingURL=git-construct-error.js.map

/***/ }),

/***/ 900:
/***/ (function(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 921:
/***/ (function(module) {


module.exports = CommitSummary;

function CommitSummary () {
   this.branch = '';
   this.commit = '';
   this.summary = {
      changes: 0,
      insertions: 0,
      deletions: 0
   };
   this.author = null;
}

var COMMIT_BRANCH_MESSAGE_REGEX = /\[([^\s]+) ([^\]]+)/;
var COMMIT_AUTHOR_MESSAGE_REGEX = /\s*Author:\s(.+)/i;

function setBranchFromCommit (commitSummary, commitData) {
   if (commitData) {
      commitSummary.branch = commitData[1];
      commitSummary.commit = commitData[2];
   }
}

function setSummaryFromCommit (commitSummary, commitData) {
   if (commitSummary.branch && commitData) {
      commitSummary.summary.changes = parseInt(commitData[1], 10) || 0;
      commitSummary.summary.insertions = parseInt(commitData[2], 10) || 0;
      commitSummary.summary.deletions = parseInt(commitData[3], 10) || 0;
   }
}

function setAuthorFromCommit (commitSummary, commitData) {
   var parts = commitData[1].split('<');
   var email = parts.pop();

   if (email.indexOf('@') <= 0) {
      return;
   }

   commitSummary.author = {
      email: email.substr(0, email.length - 1),
      name: parts.join('<').trim()
   };
}

CommitSummary.parse = function (commit) {
   var lines = commit.trim().split('\n');
   var commitSummary = new CommitSummary();

   setBranchFromCommit(commitSummary, COMMIT_BRANCH_MESSAGE_REGEX.exec(lines.shift()));

   if (COMMIT_AUTHOR_MESSAGE_REGEX.test(lines[0])) {
      setAuthorFromCommit(commitSummary, COMMIT_AUTHOR_MESSAGE_REGEX.exec(lines.shift()));
   }

   setSummaryFromCommit(commitSummary, /(\d+)[^,]*(?:,\s*(\d+)[^,]*)?(?:,\s*(\d+))?/g.exec(lines.shift()));

   return commitSummary;
};


/***/ }),

/***/ 926:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Parser for the `check-ignore` command - returns each file as a string array
 */
exports.parseCheckIgnore = (text) => {
    return text.split(/\n/g)
        .map(line => line.trim())
        .filter(file => !!file);
};
//# sourceMappingURL=CheckIgnore.js.map

/***/ }),

/***/ 941:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const git_response_error_1 = __webpack_require__(131);
const functionNamesBuilderApi = [
    'customBinary', 'env', 'outputHandler', 'silent',
];
const functionNamesPromiseApi = [
    'add',
    'addAnnotatedTag',
    'addConfig',
    'addRemote',
    'addTag',
    'binaryCatFile',
    'branch',
    'branchLocal',
    'catFile',
    'checkIgnore',
    'checkIsRepo',
    'checkout',
    'checkoutBranch',
    'checkoutLatestTag',
    'checkoutLocalBranch',
    'clean',
    'clone',
    'commit',
    'cwd',
    'deleteLocalBranch',
    'deleteLocalBranches',
    'diff',
    'diffSummary',
    'exec',
    'fetch',
    'getRemotes',
    'init',
    'listConfig',
    'listRemote',
    'log',
    'merge',
    'mergeFromTo',
    'mirror',
    'mv',
    'pull',
    'push',
    'pushTags',
    'raw',
    'rebase',
    'remote',
    'removeRemote',
    'reset',
    'revert',
    'revparse',
    'rm',
    'rmKeepLocal',
    'show',
    'stash',
    'stashList',
    'status',
    'subModule',
    'submoduleAdd',
    'submoduleInit',
    'submoduleUpdate',
    'tag',
    'tags',
    'updateServerInfo'
];
const { gitInstanceFactory } = __webpack_require__(949);
function gitP(...args) {
    let git;
    let chain = Promise.resolve();
    try {
        git = gitInstanceFactory(...args);
    }
    catch (e) {
        chain = Promise.reject(e);
    }
    function builderReturn() {
        return promiseApi;
    }
    function chainReturn() {
        return chain;
    }
    const promiseApi = [...functionNamesBuilderApi, ...functionNamesPromiseApi].reduce((api, name) => {
        const isAsync = functionNamesPromiseApi.includes(name);
        const valid = isAsync ? asyncWrapper(name, git) : syncWrapper(name, git, api);
        const alternative = isAsync ? chainReturn : builderReturn;
        Object.defineProperty(api, name, {
            enumerable: false,
            configurable: false,
            value: git ? valid : alternative,
        });
        return api;
    }, {});
    return promiseApi;
    function asyncWrapper(fn, git) {
        return function (...args) {
            if (typeof args[args.length] === 'function') {
                throw new TypeError('Promise interface requires that handlers are not supplied inline, ' +
                    'trailing function not allowed in call to ' + fn);
            }
            return chain.then(function () {
                return new Promise(function (resolve, reject) {
                    const callback = (err, result) => {
                        if (err) {
                            return reject(toError(err));
                        }
                        resolve(result);
                    };
                    args.push(callback);
                    git[fn].apply(git, args);
                });
            });
        };
    }
    function syncWrapper(fn, git, api) {
        return (...args) => {
            git[fn](...args);
            return api;
        };
    }
}
exports.gitP = gitP;
function toError(error) {
    if (error instanceof Error) {
        return error;
    }
    if (typeof error === 'string') {
        return new Error(error);
    }
    return new git_response_error_1.GitResponseError(error);
}
//# sourceMappingURL=promise-wrapped.js.map

/***/ }),

/***/ 949:
/***/ (function(module, __unusedexports, __webpack_require__) {

const Git = __webpack_require__(966);
const {GitConstructError} = __webpack_require__(732);
const {createInstanceConfig, folderExists} = __webpack_require__(847);

const api = Object.create(null);
for (let imported = __webpack_require__(732), keys = Object.keys(imported), i = 0; i < keys.length; i++) {
   const name = keys[i];
   if (/^[A-Z]/.test(name)) {
      api[name] = imported[name];
   }
}

/**
 * Adds the necessary properties to the supplied object to enable it for use as
 * the default export of a module.
 *
 * Eg: `module.exports = esModuleFactory({ something () {} })`
 */
module.exports.esModuleFactory = function esModuleFactory (defaultExport) {
   return Object.defineProperties(defaultExport, {
      __esModule: {value: true},
      default: {value: defaultExport},
   });
}

module.exports.gitExportFactory = function gitExportFactory (factory, extra) {
   return Object.assign(function () {
         return factory.apply(null, arguments);
      },
      api,
      extra || {},
   );
};

module.exports.gitInstanceFactory = function gitInstanceFactory (baseDir, options) {
   const config = createInstanceConfig(
      baseDir && (typeof baseDir === 'string' ? {baseDir} : baseDir),
      options
   );

   if (!folderExists(config.baseDir)) {
      throw new GitConstructError(config, `Cannot use simple-git on a directory that does not exist`);
   }

   return new Git(config);
};


/***/ }),

/***/ 966:
/***/ (function(module, __unusedexports, __webpack_require__) {

const responses = __webpack_require__(301);

const {GitExecutor} = __webpack_require__(701);
const {Scheduler} = __webpack_require__(421);
const {GitLogger} = __webpack_require__(178);
const {adhocExecTask, configurationErrorTask} = __webpack_require__(815);
const {NOOP, asFunction, filterArray, filterFunction, filterPlainObject, filterPrimitives, filterString, filterType, folderExists, isUserFunction} = __webpack_require__(847);
const {branchTask, branchLocalTask, deleteBranchesTask, deleteBranchTask} = __webpack_require__(17);
const {taskCallback} = __webpack_require__(850);
const {checkIsRepoTask} = __webpack_require__(221);
const {addConfigTask, listConfigTask} = __webpack_require__(597);
const {cleanWithOptionsTask, isCleanOptionsArray} = __webpack_require__(386);
const {initTask} = __webpack_require__(16);
const {mergeTask} = __webpack_require__(829);
const {moveTask} = __webpack_require__(520);
const {pullTask} = __webpack_require__(636);
const {pushTagsTask, pushTask} = __webpack_require__(435);
const {addRemoteTask, getRemotesTask, listRemotesTask, remoteTask, removeRemoteTask} = __webpack_require__(866);
const {getResetMode, resetTask} = __webpack_require__(377);
const {statusTask} = __webpack_require__(197);
const {addSubModuleTask, initSubModuleTask, subModuleTask, updateSubModuleTask} = __webpack_require__(772);
const {addAnnotatedTagTask, addTagTask, tagListTask} = __webpack_require__(540);
const {straightThroughStringTask} = __webpack_require__(815);
const {parseCheckIgnore} = __webpack_require__(926);

const ChainedExecutor = Symbol('ChainedExecutor');

/**
 * Git handling for node. All public functions can be chained and all `then` handlers are optional.
 *
 * @param {SimpleGitOptions} options Configuration settings for this instance
 *
 * @constructor
 */
function Git (options) {
   this._executor = new GitExecutor(
      options.binary, options.baseDir,
      new Scheduler(options.maxConcurrentProcesses)
   );
   this._logger = new GitLogger();
}

/**
 * The executor that runs each of the added commands
 * @type {GitExecutor}
 * @private
 */
Git.prototype._executor = null;

/**
 * Logging utility for printing out info or error messages to the user
 * @type {GitLogger}
 * @private
 */
Git.prototype._logger = null;

/**
 * Sets the path to a custom git binary, should either be `git` when there is an installation of git available on
 * the system path, or a fully qualified path to the executable.
 *
 * @param {string} command
 * @returns {Git}
 */
Git.prototype.customBinary = function (command) {
   this._executor.binary = command;
   return this;
};

/**
 * Sets an environment variable for the spawned child process, either supply both a name and value as strings or
 * a single object to entirely replace the current environment variables.
 *
 * @param {string|Object} name
 * @param {string} [value]
 * @returns {Git}
 */
Git.prototype.env = function (name, value) {
   if (arguments.length === 1 && typeof name === 'object') {
      this._executor.env = name;
   } else {
      (this._executor.env = this._executor.env || {})[name] = value;
   }

   return this;
};

/**
 * Sets the working directory of the subsequent commands.
 */
Git.prototype.cwd = function (workingDirectory, then) {
   const task = (typeof workingDirectory !== 'string')
      ? configurationErrorTask('Git.cwd: workingDirectory must be supplied as a string')
      : adhocExecTask(() => {
         if (!folderExists(workingDirectory)) {
            throw new Error(`Git.cwd: cannot change to non-directory "${ workingDirectory }"`);
         }

         return (this._executor.cwd = workingDirectory);
      });

   return this._runTask(task, Git.trailingFunctionArgument(arguments) || NOOP);
};

/**
 * Sets a handler function to be called whenever a new child process is created, the handler function will be called
 * with the name of the command being run and the stdout & stderr streams used by the ChildProcess.
 *
 * @example
 * require('simple-git')
 *    .outputHandler(function (command, stdout, stderr) {
 *       stdout.pipe(process.stdout);
 *    })
 *    .checkout('https://github.com/user/repo.git');
 *
 * @see https://nodejs.org/api/child_process.html#child_process_class_childprocess
 * @see https://nodejs.org/api/stream.html#stream_class_stream_readable
 * @param {Function} outputHandler
 * @returns {Git}
 */
Git.prototype.outputHandler = function (outputHandler) {
   this._executor.outputHandler = outputHandler;
   return this;
};

/**
 * Initialize a git repo
 *
 * @param {Boolean} [bare=false]
 * @param {Function} [then]
 */
Git.prototype.init = function (bare, then) {
   return this._runTask(
      initTask(bare === true, this._executor.cwd, Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Check the status of the local repo
 */
Git.prototype.status = function () {
   return this._runTask(
      statusTask(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * List the stash(s) of the local repo
 *
 * @param {Object|Array} [options]
 * @param {Function} [then]
 */
Git.prototype.stashList = function (options, then) {
   var handler = Git.trailingFunctionArgument(arguments);
   var opt = (handler === then ? options : null) || {};

   var splitter = opt.splitter || requireResponseHandler('ListLogSummary').SPLITTER;
   var command = ["stash", "list", "--pretty=format:"
   + requireResponseHandler('ListLogSummary').START_BOUNDARY
   + "%H %ai %s%d %aN %ae".replace(/\s+/g, splitter)
   + requireResponseHandler('ListLogSummary').COMMIT_BOUNDARY
   ];

   if (Array.isArray(opt)) {
      command = command.concat(opt);
   }

   return this._run(command, handler, {parser: Git.responseParser('ListLogSummary', splitter)});
};

/**
 * Stash the local repo
 *
 * @param {Object|Array} [options]
 * @param {Function} [then]
 */
Git.prototype.stash = function (options, then) {
   return this._run(
      ['stash'].concat(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments)
   );
};

/**
 * Clone a git repo
 *
 * @param {string} repoPath
 * @param {string} localPath
 * @param {String[]} [options] Optional array of options to pass through to the clone command
 * @param {Function} [then]
 */
Git.prototype.clone = function (repoPath, localPath, options, then) {
   const command = ['clone'].concat(Git.trailingArrayArgument(arguments));

   for (let i = 0, iMax = arguments.length; i < iMax; i++) {
      if (typeof arguments[i] === 'string') {
         command.push(arguments[i]);
      }
   }

   return this._run(command, Git.trailingFunctionArgument(arguments));
};

/**
 * Mirror a git repo
 *
 * @param {string} repoPath
 * @param {string} localPath
 * @param {Function} [then]
 */
Git.prototype.mirror = function (repoPath, localPath, then) {
   return this.clone(repoPath, localPath, ['--mirror'], then);
};

/**
 * Moves one or more files to a new destination.
 *
 * @see https://git-scm.com/docs/git-mv
 *
 * @param {string|string[]} from
 * @param {string} to
 * @param {Function} [then]
 */
Git.prototype.mv = function (from, to, then) {
   return this._runTask(moveTask(from, to), Git.trailingFunctionArgument(arguments));
};

/**
 * Internally uses pull and tags to get the list of tags then checks out the latest tag.
 *
 * @param {Function} [then]
 */
Git.prototype.checkoutLatestTag = function (then) {
   var git = this;
   return this.pull(function () {
      git.tags(function (err, tags) {
         git.checkout(tags.latest, then);
      });
   });
};

/**
 * Adds one or more files to source control
 *
 * @param {string|string[]} files
 * @param {Function} [then]
 */
Git.prototype.add = function (files, then) {
   return this._run(
      ['add'].concat(files),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Commits changes in the current working directory - when specific file paths are supplied, only changes on those
 * files will be committed.
 *
 * @param {string|string[]} message
 * @param {string|string[]} [files]
 * @param {Object} [options]
 * @param {Function} [then]
 */
Git.prototype.commit = function (message, files, options, then) {
   var command = ['commit'];

   [].concat(message).forEach(function (message) {
      command.push('-m', message);
   });

   [].push.apply(command, [].concat(typeof files === "string" || Array.isArray(files) ? files : []));

   Git._appendOptions(command, Git.trailingOptionsArgument(arguments));

   return this._run(
      command,
      Git.trailingFunctionArgument(arguments),
      {
         parser: Git.responseParser('CommitSummary'),
      },
   );
};

/**
 * Pull the updated contents of the current repo
 *
 * @param {string} [remote] When supplied must also include the branch
 * @param {string} [branch] When supplied must also include the remote
 * @param {Object} [options] Optionally include set of options to merge into the command
 * @param {Function} [then]
 */
Git.prototype.pull = function (remote, branch, options, then) {
   return this._runTask(
      pullTask(filterType(remote, filterString), filterType(branch, filterString), Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Fetch the updated contents of the current repo.
 *
 * @example
 *   .fetch('upstream', 'master') // fetches from master on remote named upstream
 *   .fetch(function () {}) // runs fetch against default remote and branch and calls function
 *
 * @param {string} [remote]
 * @param {string} [branch]
 * @param {Function} [then]
 */
Git.prototype.fetch = function (remote, branch, then) {
   const command = ["fetch"].concat(Git.getTrailingOptions(arguments));

   if (typeof remote === 'string' && typeof branch === 'string') {
      command.push(remote, branch);
   }

   return this._run(
      command,
      Git.trailingFunctionArgument(arguments),
      {
         concatStdErr: true,
         parser: Git.responseParser('FetchSummary'),
      }
   );
};

/**
 * Disables/enables the use of the console for printing warnings and errors, by default messages are not shown in
 * a production environment.
 *
 * @param {boolean} silence
 * @returns {Git}
 */
Git.prototype.silent = function (silence) {
   this._logger.silent(!!silence);
   return this;
};

/**
 * List all tags. When using git 2.7.0 or above, include an options object with `"--sort": "property-name"` to
 * sort the tags by that property instead of using the default semantic versioning sort.
 *
 * Note, supplying this option when it is not supported by your Git version will cause the operation to fail.
 *
 * @param {Object} [options]
 * @param {Function} [then]
 */
Git.prototype.tags = function (options, then) {
   return this._runTask(
      tagListTask(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Rebases the current working copy. Options can be supplied either as an array of string parameters
 * to be sent to the `git rebase` command, or a standard options object.
 *
 * @param {Object|String[]} [options]
 * @param {Function} [then]
 * @returns {Git}
 */
Git.prototype.rebase = function (options, then) {
   return this._run(
      ['rebase'].concat(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments)
   );
};

/**
 * Reset a repo
 *
 * @param {string|string[]} [mode=soft] Either an array of arguments supported by the 'git reset' command, or the
 *                                        string value 'soft' or 'hard' to set the reset mode.
 * @param {Function} [then]
 */
Git.prototype.reset = function (mode, then) {
   return this._runTask(
      resetTask(getResetMode(mode), Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Revert one or more commits in the local working copy
 *
 * @param {string} commit The commit to revert. Can be any hash, offset (eg: `HEAD~2`) or range (eg: `master~5..master~2`)
 * @param {Object} [options] Optional options object
 * @param {Function} [then]
 */
Git.prototype.revert = function (commit, options, then) {
   const next = Git.trailingFunctionArgument(arguments);

   if (typeof commit !== 'string') {
      return this._runTask(
         configurationErrorTask('Commit must be a string'),
         next,
      );
   }

   const command = ['revert'];
   Git._appendOptions(command, Git.trailingOptionsArgument(arguments));
   command.push(commit);

   return this._run(command, next);
};

/**
 * Add a lightweight tag to the head of the current branch
 *
 * @param {string} name
 * @param {Function} [then]
 */
Git.prototype.addTag = function (name, then) {
   const task = (typeof name === 'string')
      ? addTagTask(name)
      : configurationErrorTask('Git.addTag requires a tag name');

   return this._runTask(task, Git.trailingFunctionArgument(arguments));
};

/**
 * Add an annotated tag to the head of the current branch
 *
 * @param {string} tagName
 * @param {string} tagMessage
 * @param {Function} [then]
 */
Git.prototype.addAnnotatedTag = function (tagName, tagMessage, then) {
   return this._runTask(
      addAnnotatedTagTask(tagName, tagMessage),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Check out a tag or revision, any number of additional arguments can be passed to the `git checkout` command
 * by supplying either a string or array of strings as the `what` parameter.
 *
 * @param {string|string[]} what One or more commands to pass to `git checkout`
 * @param {Function} [then]
 */
Git.prototype.checkout = function (what, then) {
   const commands = ['checkout', ...Git.getTrailingOptions(arguments, true)];
   return this._runTask(
      straightThroughStringTask(commands),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Check out a remote branch
 *
 * @param {string} branchName name of branch
 * @param {string} startPoint (e.g origin/development)
 * @param {Function} [then]
 */
Git.prototype.checkoutBranch = function (branchName, startPoint, then) {
   return this.checkout(['-b', branchName, startPoint], Git.trailingFunctionArgument(arguments));
};

/**
 * Check out a local branch
 */
Git.prototype.checkoutLocalBranch = function (branchName, then) {
   return this.checkout(['-b', branchName], Git.trailingFunctionArgument(arguments));
};

/**
 * Delete a local branch
 */
Git.prototype.deleteLocalBranch = function (branchName, forceDelete, then) {
   return this._runTask(
      deleteBranchTask(branchName, typeof forceDelete === "boolean" ? forceDelete : false),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Delete one or more local branches
 */
Git.prototype.deleteLocalBranches = function (branchNames, forceDelete, then) {
   return this._runTask(
      deleteBranchesTask(branchNames, typeof forceDelete === "boolean" ? forceDelete : false),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * List all branches
 *
 * @param {Object | string[]} [options]
 * @param {Function} [then]
 */
Git.prototype.branch = function (options, then) {
   return this._runTask(
      branchTask(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Return list of local branches
 *
 * @param {Function} [then]
 */
Git.prototype.branchLocal = function (then) {
   return this._runTask(
      branchLocalTask(),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Add config to local git instance
 *
 * @param {string} key configuration key (e.g user.name)
 * @param {string} value for the given key (e.g your name)
 * @param {boolean} [append=false] optionally append the key/value pair (equivalent of passing `--add` option).
 * @param {Function} [then]
 */
Git.prototype.addConfig = function (key, value, append, then) {
   return this._runTask(
      addConfigTask(key, value, typeof append === "boolean" ? append : false),
      Git.trailingFunctionArgument(arguments),
   );
};

Git.prototype.listConfig = function () {
   return this._runTask(listConfigTask(), Git.trailingFunctionArgument(arguments));
};

/**
 * Executes any command against the git binary.
 *
 * @param {string[]|Object} commands
 * @param {Function} [then]
 *
 * @returns {Git}
 */
Git.prototype.raw = function (commands, then) {
   const createRestCommands = !Array.isArray(commands);
   const command = [].slice.call(createRestCommands ? arguments : commands, 0);

   for (let i = 0; i < command.length && createRestCommands; i++) {
      if (!filterPrimitives(command[i])) {
         command.splice(i, command.length - i);
         break;
      }
   }

   Git._appendOptions(command, Git.trailingOptionsArgument(arguments));

   var next = Git.trailingFunctionArgument(arguments);

   if (!command.length) {
      return this._runTask(
         configurationErrorTask('Raw: must supply one or more command to execute'),
         next,
      );
   }

   return this._run(command, next);
};

Git.prototype.submoduleAdd = function (repo, path, then) {
   return this._runTask(
      addSubModuleTask(repo, path),
      Git.trailingFunctionArgument(arguments),
   );
};

Git.prototype.submoduleUpdate = function (args, then) {
   return this._runTask(
      updateSubModuleTask(Git.getTrailingOptions(arguments, true)),
      Git.trailingFunctionArgument(arguments),
   );
};

Git.prototype.submoduleInit = function (args, then) {
   return this._runTask(
      initSubModuleTask(Git.getTrailingOptions(arguments, true)),
      Git.trailingFunctionArgument(arguments),
   );
};

Git.prototype.subModule = function (options, then) {
   return this._runTask(
      subModuleTask(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * List remote
 *
 * @param {string[]} [args]
 * @param {Function} [then]
 */
Git.prototype.listRemote = function (args, then) {
   return this._runTask(
      listRemotesTask(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Adds a remote to the list of remotes.
 */
Git.prototype.addRemote = function (remoteName, remoteRepo, then) {
   return this._runTask(
      addRemoteTask(remoteName, remoteRepo, Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Removes an entry by name from the list of remotes.
 */
Git.prototype.removeRemote = function (remoteName, then) {
   return this._runTask(
      removeRemoteTask(remoteName),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Gets the currently available remotes, setting the optional verbose argument to true includes additional
 * detail on the remotes themselves.
 */
Git.prototype.getRemotes = function (verbose, then) {
   return this._runTask(
      getRemotesTask(verbose === true),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Call any `git remote` function with arguments passed as an array of strings.
 *
 * @param {string[]} options
 * @param {Function} [then]
 */
Git.prototype.remote = function (options, then) {
   return this._runTask(
      remoteTask(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Merges from one branch to another, equivalent to running `git merge ${from} $[to}`, the `options` argument can
 * either be an array of additional parameters to pass to the command or null / omitted to be ignored.
 *
 * @param {string} from
 * @param {string} to
 * @param {string[]} [options]
 * @param {Function} [then]
 */
Git.prototype.mergeFromTo = function (from, to, options, then) {
   if (!(filterString(from) && filterString(to))) {
      return this._runTask(configurationErrorTask(
         `Git.mergeFromTo requires that the 'from' and 'to' arguments are supplied as strings`
      ));
   }

   return this._runTask(
      mergeTask([from, to, ...Git.getTrailingOptions(arguments)]),
      Git.trailingUserFunctionArgument(arguments),
   );
};

/**
 * Runs a merge, `options` can be either an array of arguments
 * supported by the [`git merge`](https://git-scm.com/docs/git-merge)
 * or an options object.
 *
 * Conflicts during the merge result in an error response,
 * the response type whether it was an error or success will be a MergeSummary instance.
 * When successful, the MergeSummary has all detail from a the PullSummary
 *
 * @param {Object | string[]} [options]
 * @param {Function} [then]
 * @returns {*}
 *
 * @see ./responses/MergeSummary.js
 * @see ./responses/PullSummary.js
 */
Git.prototype.merge = function (options, then) {
   return this._runTask(
      mergeTask(Git.getTrailingOptions(arguments)),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Call any `git tag` function with arguments passed as an array of strings.
 *
 * @param {string[]} options
 * @param {Function} [then]
 */
Git.prototype.tag = function (options, then) {
   const command = Git.getTrailingOptions(arguments);

   if (command[0] !== 'tag') {
      command.unshift('tag');
   }

   return this._run(command, Git.trailingFunctionArgument(arguments));
};

/**
 * Updates repository server info
 *
 * @param {Function} [then]
 */
Git.prototype.updateServerInfo = function (then) {
   return this._run(["update-server-info"], Git.trailingFunctionArgument(arguments));
};

/**
 * Pushes the current committed changes to a remote, optionally specify the names of the remote and branch to use
 * when pushing. Supply multiple options as an array of strings in the first argument - see examples below.
 *
 * @param {string|string[]} [remote]
 * @param {string} [branch]
 * @param {Function} [then]
 */
Git.prototype.push = function (remote, branch, then) {
   const task = pushTask(
      {remote: filterType(remote, filterString), branch: filterType(branch, filterString)},
      Git.getTrailingOptions(arguments),
   );
   return this._runTask(task, Git.trailingFunctionArgument(arguments));
};

/**
 * Pushes the current tag changes to a remote which can be either a URL or named remote. When not specified uses the
 * default configured remote spec.
 *
 * @param {string} [remote]
 * @param {Function} [then]
 */
Git.prototype.pushTags = function (remote, then) {
   const task = pushTagsTask({remote: filterType(remote, filterString)}, Git.getTrailingOptions(arguments));

   return this._runTask(task, Git.trailingFunctionArgument(arguments));
};

/**
 * Removes the named files from source control.
 *
 * @param {string|string[]} files
 * @param {Function} [then]
 */
Git.prototype.rm = function (files, then) {
   return this._rm(files, '-f', then);
};

/**
 * Removes the named files from source control but keeps them on disk rather than deleting them entirely. To
 * completely remove the files, use `rm`.
 *
 * @param {string|string[]} files
 * @param {Function} [then]
 */
Git.prototype.rmKeepLocal = function (files, then) {
   return this._rm(files, '--cached', then);
};

/**
 * Returns a list of objects in a tree based on commit hash. Passing in an object hash returns the object's content,
 * size, and type.
 *
 * Passing "-p" will instruct cat-file to determine the object type, and display its formatted contents.
 *
 * @param {string[]} [options]
 * @param {Function} [then]
 */
Git.prototype.catFile = function (options, then) {
   return this._catFile('utf-8', arguments);
};

/**
 * Equivalent to `catFile` but will return the native `Buffer` of content from the git command's stdout.
 *
 * @param {string[]} options
 * @param then
 */
Git.prototype.binaryCatFile = function (options, then) {
   return this._catFile('buffer', arguments);
};

Git.prototype._catFile = function (format, args) {
   var handler = Git.trailingFunctionArgument(args);
   var command = ['cat-file'];
   var options = args[0];

   if (typeof options === 'string') {
      return this._runTask(
         configurationErrorTask('Git#catFile: options must be supplied as an array of strings'),
         handler,
      );
   }

   if (Array.isArray(options)) {
      command.push.apply(command, options);
   }

   return this._run(command, handler, {
      format: format
   });
};

/**
 * Return repository changes.
 *
 * @param {string[]} [options]
 * @param {Function} [then]
 */
Git.prototype.diff = function (options, then) {
   var command = ['diff'];

   if (typeof options === 'string') {
      command[0] += ' ' + options;
      this._logger.warn('Git#diff: supplying options as a single string is now deprecated, switch to an array of strings');
   } else if (Array.isArray(options)) {
      command.push.apply(command, options);
   }

   if (typeof arguments[arguments.length - 1] === 'function') {
      then = arguments[arguments.length - 1];
   }

   return this._run(command, function (err, data) {
      then && then(err, data);
   });
};

Git.prototype.diffSummary = function (options, then) {
   return this._run(
      ['diff', '--stat=4096'].concat(Git.getTrailingOptions(arguments, true)),
      Git.trailingFunctionArgument(arguments),
      {
         parser: Git.responseParser('DiffSummary'),
      }
   );
};

Git.prototype.revparse = function (options, then) {
   const commands = ['rev-parse', ...Git.getTrailingOptions(arguments, true)];
   return this._runTask(
      straightThroughStringTask(commands, true),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Show various types of objects, for example the file at a certain commit
 *
 * @param {string[]} [options]
 * @param {Function} [then]
 */
Git.prototype.show = function (options, then) {
   var handler = Git.trailingFunctionArgument(arguments) || NOOP;

   var command = ['show'];
   if (typeof options === 'string' || Array.isArray(options)) {
      command = command.concat(options);
   }

   return this._run(command, function (err, data) {
      err ? handler(err) : handler(null, data);
   });
};

/**
 */
Git.prototype.clean = function (mode, options, then) {
   const usingCleanOptionsArray = isCleanOptionsArray(mode);
   const cleanMode = usingCleanOptionsArray && mode.join('') || filterType(mode, filterString) || '';
   const customArgs = Git.getTrailingOptions([].slice.call(arguments, usingCleanOptionsArray ? 1 : 0));

   return this._runTask(
      cleanWithOptionsTask(cleanMode, customArgs),
      Git.trailingFunctionArgument(arguments),
   );
};

/**
 * Call a simple function at the next step in the chain.
 * @param {Function} [then]
 */
Git.prototype.exec = function (then) {
   const task = {
      commands: [],
      format: 'utf-8',
      parser () {
         if (typeof then === 'function') {
            then();
         }
      }
   };

   return this._runTask(task);
};

/**
 * Show commit logs from `HEAD` to the first commit.
 * If provided between `options.from` and `options.to` tags or branch.
 *
 * Additionally you can provide options.file, which is the path to a file in your repository. Then only this file will be considered.
 *
 * To use a custom splitter in the log format, set `options.splitter` to be the string the log should be split on.
 *
 * Options can also be supplied as a standard options object for adding custom properties supported by the git log command.
 * For any other set of options, supply options as an array of strings to be appended to the git log command.
 *
 * @param {Object|string[]} [options]
 * @param {boolean} [options.strictDate=true] Determine whether to use strict ISO date format (default) or not (when set to `false`)
 * @param {string} [options.from] The first commit to include
 * @param {string} [options.to] The most recent commit to include
 * @param {string} [options.file] A single file to include in the result
 * @param {boolean} [options.multiLine] Optionally include multi-line commit messages
 *
 * @param {Function} [then]
 */
Git.prototype.log = function (options, then) {
   var handler = Git.trailingFunctionArgument(arguments);
   var opt = Git.trailingOptionsArgument(arguments) || {};

   var splitter = opt.splitter || requireResponseHandler('ListLogSummary').SPLITTER;
   var format = opt.format || {
      hash: '%H',
      date: opt.strictDate === false ? '%ai' : '%aI',
      message: '%s',
      refs: '%D',
      body: opt.multiLine ? '%B' : '%b',
      author_name: '%aN',
      author_email: '%ae'
   };
   var rangeOperator = (opt.symmetric !== false) ? '...' : '..';

   var fields = Object.keys(format);
   var formatstr = fields.map(function (k) {
      return format[k];
   }).join(splitter);
   var suffix = [];
   var command = ["log", "--pretty=format:"
   + requireResponseHandler('ListLogSummary').START_BOUNDARY
   + formatstr
   + requireResponseHandler('ListLogSummary').COMMIT_BOUNDARY
   ];

   if (filterArray(options)) {
      command = command.concat(options);
      opt = {};
   } else if (typeof arguments[0] === "string" || typeof arguments[1] === "string") {
      this._logger.warn('Git#log: supplying to or from as strings is now deprecated, switch to an options configuration object');
      opt = {
         from: arguments[0],
         to: arguments[1]
      };
   }

   if (opt.n || opt['max-count']) {
      command.push("--max-count=" + (opt.n || opt['max-count']));
   }

   if (opt.from && opt.to) {
      command.push(opt.from + rangeOperator + opt.to);
   }

   if (opt.file) {
      suffix.push("--follow", options.file);
   }

   'splitter n max-count file from to --pretty format symmetric multiLine strictDate'.split(' ').forEach(function (key) {
      delete opt[key];
   });

   Git._appendOptions(command, opt);

   return this._run(
      command.concat(suffix),
      handler,
      {
         parser: Git.responseParser('ListLogSummary', [splitter, fields])
      }
   );
};

/**
 * Clears the queue of pending commands and returns the wrapper instance for chaining.
 *
 * @returns {Git}
 */
Git.prototype.clearQueue = function () {
   // TODO:
   // this._executor.clear();
   return this;
};

/**
 * Check if a pathname or pathnames are excluded by .gitignore
 *
 * @param {string|string[]} pathnames
 * @param {Function} [then]
 */
Git.prototype.checkIgnore = function (pathnames, then) {
   var handler = Git.trailingFunctionArgument(arguments);
   var command = ["check-ignore"];

   if (handler !== pathnames) {
      command = command.concat(pathnames);
   }

   return this._run(command, function (err, data) {
      handler && handler(err, !err && parseCheckIgnore(data));
   });
};

Git.prototype.checkIsRepo = function (checkType, then) {
   return this._runTask(
      checkIsRepoTask(filterType(checkType, filterString)),
      Git.trailingFunctionArgument(arguments),
   );
};

Git.prototype._rm = function (_files, options, then) {
   var files = [].concat(_files);
   var args = ['rm', options];
   args.push.apply(args, files);

   return this._run(args, Git.trailingFunctionArgument(arguments));
};

/**
 * Schedules the supplied command to be run, the command should not include the name of the git binary and should
 * be an array of strings passed as the arguments to the git binary.
 *
 * @param {string[]} command
 * @param {Function} then
 * @param {Object} [opt]
 * @param {boolean} [opt.concatStdErr=false] Optionally concatenate stderr output into the stdout
 * @param {boolean} [opt.format="utf-8"] The format to use when reading the content of stdout
 * @param {Function} [opt.onError] Optional error handler for this command - can be used to allow non-clean exits
 *                                  without killing the remaining stack of commands
 * @param {Function} [opt.parser] Optional parser function
 * @param {number} [opt.onError.exitCode]
 * @param {string} [opt.onError.stdErr]
 *
 * @returns {Git}
 */
Git.prototype._run = function (command, then, opt) {

   const task = Object.assign({
      concatStdErr: false,
      onError: undefined,
      format: 'utf-8',
      parser (data) {
         return data;
      }
   }, opt || {}, {
      commands: command,
   });

   return this._runTask(task, then);
};

Git.prototype._runTask = function (task, then) {
   const executor = this[ChainedExecutor] || this._executor.chain();
   const promise = executor.push(task);

   taskCallback(
      task,
      promise,
      then);

   return Object.create(this, {
      then: {value: promise.then.bind(promise)},
      catch: {value: promise.catch.bind(promise)},
      [ChainedExecutor]: {value: executor},
   });
};

/**
 * Handles an exception in the processing of a command.
 */
Git.fail = function (git, error, handler) {
   git._logger.error(error);

   git.clearQueue();

   if (typeof handler === 'function') {
      handler.call(git, error, null);
   }
};

/**
 * Given any number of arguments, returns the last argument if it is a function, otherwise returns null.
 * @returns {Function|null}
 */
Git.trailingFunctionArgument = function (args) {
   return asFunction(args[args.length - 1]);
};

/**
 * Given any number of arguments, returns the last argument if it is a function, otherwise returns null.
 * @returns {Function|null}
 */
Git.trailingUserFunctionArgument = function (args) {
   return filterType(args[args.length - 1], isUserFunction);
};

/**
 * Given any number of arguments, returns the trailing options argument, ignoring a trailing function argument
 * if there is one. When not found, the return value is null.
 * @returns {Object|null}
 */
Git.trailingOptionsArgument = function (args) {
   const hasTrailingCallback = filterFunction(args[args.length - 1]);
   const options = args[args.length - (hasTrailingCallback ? 2 : 1)];

   return filterType(options, filterPlainObject) || null;
};

/**
 * Given any number of arguments, returns the trailing options array argument, ignoring a trailing function argument
 * if there is one. When not found, the return value is an empty array.
 * @returns {Array}
 */
Git.trailingArrayArgument = function (args) {
   const hasTrailingCallback = filterFunction(args[args.length - 1]);
   const options = args[args.length - (hasTrailingCallback ? 2 : 1)];

   return filterType(options, filterArray) || [];
};

/**
 * Appends a trailing object, and trailing array of options to a new array and returns that array.
 */
Git.getTrailingOptions = function (args, includeInitialPrimitive) {
   var command = [];
   if (includeInitialPrimitive && args.length && filterPrimitives(args[0])) {
      command.push(args[0]);
   }

   Git._appendOptions(command, Git.trailingOptionsArgument(args));
   command.push.apply(command, Git.trailingArrayArgument(args));

   return command;
};

/**
 * Mutates the supplied command array by merging in properties in the options object. When the
 * value of the item in the options object is a string it will be concatenated to the key as
 * a single `name=value` item, otherwise just the name will be used.
 *
 * @param {string[]} command
 * @param {Object} options
 * @private
 */
Git._appendOptions = function (command, options) {
   if (options === null) {
      return;
   }

   Object.keys(options).forEach(function (key) {
      var value = options[key];
      if (typeof value === 'string') {
         command.push(key + '=' + value);
      } else {
         command.push(key);
      }
   });
};

/**
 * Creates a parser for a task
 *
 * @param {string} type
 * @param {any[]} [args]
 */
Git.responseParser = function (type, args) {
   const handler = requireResponseHandler(type);
   return function (data) {
      return handler.parse.apply(handler, [data].concat(args === undefined ? [] : args));
   };
};

/**
 * Marks the git instance as having had a fatal exception by clearing the pending queue of tasks and
 * logging to the console.
 *
 * @param git
 * @param error
 * @param callback
 */
Git.exception = function (git, error, callback) {
   const err = error instanceof Error ? error : new Error(error);

   if (typeof callback === 'function') {
      callback(err);
   }

   throw err;
};

module.exports = Git;

/**
 * Requires and returns a response handler based on its named type
 * @param {string} type
 */
function requireResponseHandler (type) {
   return responses[type];
}


/***/ }),

/***/ 999:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(847);
function parseGetRemotes(text) {
    const remotes = {};
    forEach(text, ([name]) => remotes[name] = { name });
    return Object.values(remotes);
}
exports.parseGetRemotes = parseGetRemotes;
function parseGetRemotesVerbose(text) {
    const remotes = {};
    forEach(text, ([name, url, purpose]) => {
        if (!remotes.hasOwnProperty(name)) {
            remotes[name] = {
                name: name,
                refs: { fetch: '', push: '' },
            };
        }
        if (purpose && url) {
            remotes[name].refs[purpose.replace(/[^a-z]/g, '')] = url;
        }
    });
    return Object.values(remotes);
}
exports.parseGetRemotesVerbose = parseGetRemotesVerbose;
function forEach(text, handler) {
    utils_1.forEachLineWithContent(text, (line) => handler(line.split(/\s+/)));
}
//# sourceMappingURL=GetRemoteSummary.js.map

/***/ })

/******/ });
//# sourceMappingURL=index.js.map