exports.getAnalytics = async (req, res) => {
    try {
      const mockData = {
        followers: [1200, 1250, 1280, 1295, 1330, 1360, 1400],
        engagement: [
          { post: 1, likes: 320, comments: 25 },
          { post: 2, likes: 400, comments: 40 },
          { post: 3, likes: 290, comments: 10 },
        ],
        bestPostTime: "Wednesday 7 PM",
      };
      res.status(200).json({
        status: 'success',
        data: mockData
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };