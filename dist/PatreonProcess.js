"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.PatreonProcess = void 0;
const https = __importStar(require("https"));
class PatreonProcess {
    /** Async request patreon api */
    static asyncRequest(endPoints) {
        return __awaiter(this, void 0, void 0, function* () {
            /* Build request option */
            let options = {
                host: 'www.patreon.com',
                port: 443,
                path: `/api/oauth2/v2/${endPoints}`,
                headers: {
                    'Authorization': 'Bearer ' + PatreonProcess.TOKEN
                }
            };
            /* Send request and try parse reponse */
            return new Promise(function (resolve, reject) {
                https.get(options, (response) => {
                    let data = "";
                    response.on('data', (v) => data += v);
                    response.on('close', (e) => reject(e));
                    response.on('error', (e) => reject(e));
                    response.on('end', () => {
                        // has data ?
                        let isValid = data && data.length > 0;
                        if (isValid) {
                            // try parse json
                            try {
                                let obj = JSON.parse(data);
                                resolve(obj);
                            }
                            catch (error) {
                                reject("failled parse json");
                            }
                        }
                        else {
                            reject("empty data response");
                        }
                    });
                });
            });
        });
    }
    /** Get all campaigns */
    static getAllCompaigns() {
        return __awaiter(this, void 0, void 0, function* () {
            const campaignsIdentifier = [];
            return PatreonProcess.asyncRequest("campaigns")
                .then((v) => {
                //console.log(data)
                if (v.data)
                    v.data.forEach((campaign) => {
                        if (campaign && campaign.id)
                            campaignsIdentifier.push(campaign.id);
                        else
                            console.warn("ignored campaign value", { campaign: campaign });
                    });
                else
                    console.warn("ignored campaign data", { data: v.data });
                return campaignsIdentifier;
            });
        });
    }
    /** Get all members for campaigns */
    static getAllMembers(campaignsIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPromises = [];
            // iterate all campaign and get member (iterate all page))
            campaignsIdentifier.forEach((campaign_id) => {
                allPromises.push(PatreonProcess.preGetAllMembers(campaign_id, "?fields%5Bmember%5D=patron_status"));
            });
            let active = [], other = [];
            return Promise.all(allPromises)
                .then((v) => {
                v.forEach(data => {
                    active = active.concat(data.active);
                    other = other.concat(data.other);
                });
                return {
                    active: active,
                    other: other
                };
            })
                .catch((e) => {
                console.error(e.message);
                return {
                    active: active,
                    other: other
                };
            });
        });
    }
    static preGetAllMembers(campaign_id, params, activePatron = [], otherPatron = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return PatreonProcess.asyncRequest(`campaigns/${campaign_id}/members${params}`)
                .then((v) => {
                if (v.data) {
                    v.data.forEach((member) => {
                        // has id
                        if (member.id) {
                            // active patron
                            if (member.attributes && member.attributes.patron_status === "active_patron")
                                activePatron.push(member.id);
                            // declined/former patron
                            else
                                otherPatron.push(member.id);
                        }
                    });
                }
                // has next links ? (add to all promise)
                if (v.links && v.links.next && v.links.next.length > 0) {
                    let nextURL = new URL(v.links.next);
                    if (nextURL.search && nextURL.search.length > 0)
                        return PatreonProcess.preGetAllMembers(campaign_id, nextURL.search, activePatron, otherPatron);
                }
                return {
                    active: activePatron,
                    other: otherPatron
                };
            })
                .catch((e) => {
                console.error(e.message);
                return {
                    active: activePatron,
                    other: otherPatron
                };
            });
        });
    }
    /** Get all attribute members */
    static getAllAttributesMembers(membersId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPromises = [];
            membersId.forEach(id => allPromises.push(PatreonProcess.preGetAttributeMembers(id)));
            const attrMaps = new Map();
            return Promise.all(allPromises)
                .then((v) => {
                v.forEach(data => {
                    if (!attrMaps.has(data.member_id))
                        attrMaps.set(data.member_id, data);
                });
                return attrMaps;
            })
                .catch((e) => {
                console.error(e.message);
                return attrMaps;
            });
        });
    }
    static preGetAttributeMembers(member_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let imgUrl = "", fullName = "";
            return PatreonProcess.asyncRequest(`members/${member_id}?include=user&fields%5Buser%5D=full_name,image_url`)
                .then((v) => {
                if (v.included && v.included[0] && v.included[0].attributes) {
                    imgUrl = v.included[0].attributes.image_url;
                    fullName = v.included[0].attributes.full_name;
                }
                else {
                    console.warn("Ignored attribute patreon", { value: v });
                }
                return {
                    member_id: member_id,
                    full_name: fullName,
                    image_url: imgUrl
                };
            })
                .catch(e => {
                console.error(e.message);
                return {
                    member_id: -1,
                    full_name: fullName,
                    image_url: imgUrl
                };
            });
        });
    }
}
exports.PatreonProcess = PatreonProcess;
PatreonProcess.TOKEN = "";
//# sourceMappingURL=PatreonProcess.js.map