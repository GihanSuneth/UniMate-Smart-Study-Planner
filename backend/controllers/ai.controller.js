const geminiService = require('../services/gemini.service');

exports.processAIRequest = async (req, res) => {
  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json({ message: "Type and data are required" });
  }

  try {
    console.log(`[AIController] Processing ${type} request for module: ${data.module || 'Overall'}`);
    const result = await geminiService.generateContent(type, data);
    console.log(`[AIController] Success: AI content generated for ${type}`);
    res.status(200).json(result);
  } catch (error) {
    console.error("[AIController] Error:", error.message);
    const status = error.message.includes('429') || error.message.toLowerCase().includes('quota') ? 429 : 500;
    res.status(status).json({ message: error.message });
  }
};
