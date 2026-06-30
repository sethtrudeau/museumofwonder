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
    dbIdSet: !!NOTION_DB_ID,
    nodeEnv: process.env.NODE_ENV,
    notionResult,
    notionError,
  });
};
