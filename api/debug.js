'use strict';

module.exports = (req, res) => {
  res.json({
    tokenSet: !!process.env.NOTION_TOKEN,
    dbIdSet: !!process.env.NOTION_EXHIBITS_DB_ID,
    notionKeys: Object.keys(process.env).filter(k => k.startsWith('NOTION')),
    nodeEnv: process.env.NODE_ENV,
  });
};
