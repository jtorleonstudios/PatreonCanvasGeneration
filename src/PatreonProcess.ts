import * as https from "https"

export class PatreonProcess {
    public static TOKEN = "";

    /** Async request patreon api */
    private static async asyncRequest(endPoints: string) {
        /* Build request option */
        let options: https.RequestOptions = {
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
                        } catch (error) {
                            reject("failled parse json")
                        }
                    } else {
                        reject("empty data response")
                    }
                });
            });
        })
    }

    /** Get all campaigns */
    public static async getAllCompaigns() {
        const campaignsIdentifier: string[] = []
        return PatreonProcess.asyncRequest("campaigns")
            .then((v: any) => {
                //console.log(data)
                if (v.data)
                    v.data.forEach((campaign: any) => {
                        if (campaign && campaign.id)
                            campaignsIdentifier.push(campaign.id);
                        else
                            console.warn("ignored campaign value", { campaign: campaign })
                    });
                else
                    console.warn("ignored campaign data", { data: v.data })
                return campaignsIdentifier;
            })
    }

    /** Get all members for campaigns */
    public static async getAllMembers(campaignsIdentifier: string[]) {
        const allPromises: Promise<any>[] = [];
        // iterate all campaign and get member (iterate all page))
        campaignsIdentifier.forEach((campaign_id: string) => {
            allPromises.push(PatreonProcess.preGetAllMembers(campaign_id, "?fields%5Bmember%5D=patron_status"));
        });

        let active: string[] = [], other: string[] = [];
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
            })
    }

    private static async preGetAllMembers(campaign_id: string, params: string, activePatron: string[] = [], otherPatron: string[] = []) {
        return PatreonProcess.asyncRequest(`campaigns/${campaign_id}/members${params}`)
            .then((v: any) => {
                if (v.data) {
                    v.data.forEach((member: any) => {
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
                        return PatreonProcess.preGetAllMembers(campaign_id, nextURL.search, activePatron, otherPatron)
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
            })
    }

    /** Get all attribute members */
    public static async getAllAttributesMembers(membersId: string[]) {
        const allPromises: Promise<any>[] = [];
        membersId.forEach(id => allPromises.push(PatreonProcess.preGetAttributeMembers(id)));
        const attrMaps = new Map<string, any>();
        return Promise.all(allPromises)
            .then((v) => {
                v.forEach(data => {
                    if (!attrMaps.has(data.member_id))
                        attrMaps.set(data.member_id, data)
                });
                return attrMaps;
            })
            .catch((e) => {
                console.error(e.message)
                return attrMaps;
            });
    }

    private static async preGetAttributeMembers(member_id: string) {
        let imgUrl = "", fullName = "";
        return PatreonProcess.asyncRequest(`members/${member_id}?include=user&fields%5Buser%5D=full_name,image_url`)
            .then((v: any) => {
                if (v.included && v.included[0] && v.included[0].attributes) {
                    imgUrl = v.included[0].attributes.image_url;
                    fullName = v.included[0].attributes.full_name;
                } else {
                    console.warn("Ignored attribute patreon", { value: v })
                }
                return {
                    member_id: member_id,
                    full_name: fullName,
                    image_url: imgUrl
                }
            })
            .catch(e => {
                console.error(e.message);
                return {
                    member_id: -1,
                    full_name: fullName,
                    image_url: imgUrl
                }
            })
    }
}