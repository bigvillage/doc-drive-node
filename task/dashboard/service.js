const Upload = require("../documents/upload/models/upload");
const axios = require("axios");

const getDashboard = async (req, res, qObj, callback) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalDocuments,
            todayUploads,
            favoriteCount,
            recentDocuments
        ] = await Promise.all([
            // 전체 문서
            Upload.countDocuments(),
            // 오늘 업로드문서
            Upload.countDocuments({
                createdAt: { $gte: today }
            }),
            // 즐겨찾기
            Upload.countDocuments({
                isFavorite: true
            }),
            // 최근 문서 5개
            Upload.find()
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .select(
                    "title createdAt files content isFavorite"
                )
        ]);

        callback(null, {
            result: true,
            data: {
                totalDocuments,
                todayUploads,
                favoriteCount,
                recentDocuments
            }
        });

    } catch (err) {
        callback(err);
    }
};

module.exports = {
    getDashboard
};