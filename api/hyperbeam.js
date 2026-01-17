export default async function handler(req, res) {
    // 1. Set CORS headers so your frontend can talk to this script
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const API_KEY = process.env.HB_API_KEY;
    const PROFILE_ID = "my_permanent_cloud_pc";
    const headers = { 
        "Authorization": `Bearer ${API_KEY}`, 
        "Content-Type": "application/json" 
    };

    try {
        // STEP 1: Get all active sessions
        const listRes = await fetch("https://engine.hyperbeam.com/v0/vm", { headers });
        const sessions = await listRes.json();

        // STEP 2: Kill all active sessions
        if (Array.isArray(sessions) && sessions.length > 0) {
            for (const s of sessions) {
                await fetch(`https://engine.hyperbeam.com/v0/vm/${s.id}`, { method: "DELETE", headers });
            }
            // STEP 3: Wait 3 seconds for the cloud to save your data
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // STEP 4: Start a new session with Load/Save enabled
        const startRes = await fetch("https://engine.hyperbeam.com/v0/vm", {
            method: "POST",
            headers,
            body: JSON.stringify({
                profile: { load: PROFILE_ID, save: true },
                timeout: { offline: 3600 }
            })
        });

        const data = await startRes.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}