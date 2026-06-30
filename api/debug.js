'use strict';

module.exports = async (req, res) => {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_EXHIBITS_DB_ID;

  let notionResult = null;
  let notionError = null;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 1 }),
    });
    const text = await response.text();
    notionResult = { status: response.status, body: text.slice(0, 500) };
  } catch (err) {
    notionError = err.message;
  }

  res.json({
    tokenSet: !!NOTION_TOKEN,
    tokenPreview: NOTION_TOKEN ? `${NOTION_TOKEN.slice(0, 6)}...${NOTION_TOKEN.slice(-4)}` : null,
    dbIdSet: !!NOTION_DB_ID,
    dbIdPreview: NOTION_DB_ID ? `${NOTION_DB_ID.slice(0, 6)}...${NOTION_DB_ID.slice(-4)}` : null,
    nodeEnv: process.env.NODE_ENV,
    notionResult,
    notionError,
  });
};
