import sql from "../configs/db.js"

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access: user ID not found",
            });
        }

        const creations = await sql`
      SELECT * FROM creations 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC`;

        res.status(200).json({ success: true, creations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`select * from 
            creations where publish = true order by created_at desc`
        res.status(200).json({ success: true, creations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}