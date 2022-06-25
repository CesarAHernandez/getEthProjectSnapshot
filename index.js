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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require("dotenv/config");
var fs = require("fs");
var ethers_1 = require("ethers");
var initProvider = function () {
    var nodeUrl = process.env.ETH_NODE_URL;
    var contractAbi = '';
    try {
        contractAbi = JSON.parse(process.env.CONTRACT_ABI);
    }
    catch (err) {
        /* handle error */
        console.error(err.message);
    }
    var contractAddress = process.env.CONTRACT_ADDRESS;
    var provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(nodeUrl, 1);
    // Note we don't need a signer
    return new ethers_1.ethers.Contract(contractAddress, contractAbi, provider);
};
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
var getOwnerBatch = function (start, end, getFn) { return __awaiter(void 0, void 0, void 0, function () {
    var owners, i, len, ownerAddress, err_1, ownerAddress, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                owners = {};
                i = start, len = end;
                _a.label = 1;
            case 1:
                if (!(i < len)) return [3 /*break*/, 11];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 10]);
                return [4 /*yield*/, getFn(i)];
            case 3:
                ownerAddress = _a.sent();
                owners[i] = ownerAddress;
                return [3 /*break*/, 10];
            case 4:
                err_1 = _a.sent();
                _a.label = 5;
            case 5:
                _a.trys.push([5, 8, , 9]);
                // retry
                return [4 /*yield*/, sleep(500)];
            case 6:
                // retry
                _a.sent();
                return [4 /*yield*/, getFn(i)];
            case 7:
                ownerAddress = _a.sent();
                owners[i] = ownerAddress;
                return [3 /*break*/, 9];
            case 8:
                err_2 = _a.sent();
                /* handle error */
                console.log(err_2.message, "id: ".concat(i));
                return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 10];
            case 10:
                i++;
                return [3 /*break*/, 1];
            case 11: return [2 /*return*/, owners];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var contract, totalSupplyBN, totalSupply, batchSize, amountOfBatches, promises, i, len, start, end, results, owners, saveDir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Initializing contract');
                contract = initProvider();
                return [4 /*yield*/, contract.totalSupply()];
            case 1:
                totalSupplyBN = _a.sent();
                totalSupply = totalSupplyBN.toNumber();
                batchSize = Math.ceil(totalSupply / 30);
                amountOfBatches = Math.ceil(totalSupply / batchSize);
                console.log('Amount of batches of', batchSize, 'is', amountOfBatches);
                promises = [];
                for (i = 0, len = amountOfBatches; i < len; i++) {
                    start = i * batchSize;
                    end = start + batchSize;
                    if (i === len - 1) {
                        end = start + totalSupply;
                        promises.push(getOwnerBatch(start, end + 1, contract.ownerOf));
                        continue;
                    }
                    totalSupply -= batchSize;
                    promises.push(getOwnerBatch(start, end + 1, contract.ownerOf));
                }
                console.log('Getting the owners of the contract');
                return [4 /*yield*/, Promise.all(promises)];
            case 2:
                results = _a.sent();
                owners = {};
                results.forEach(function (chunk) {
                    var addresses = Object.values(chunk);
                    addresses.forEach(function (address) {
                        owners[address] = owners[address] ? owners[address] + 1 : 1;
                    });
                });
                saveDir = process.env.SAVE_DIR ? process.env.SAVE_DIR : './whiteList.json';
                fs.writeFileSync(saveDir, JSON.stringify({ addresses: Object.keys(owners) }), 'utf-8');
                return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, main()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
