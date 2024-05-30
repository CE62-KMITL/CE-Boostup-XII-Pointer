/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "s3msmjm6s748d5h",
    "created": "2024-05-30 14:32:05.002Z",
    "updated": "2024-05-30 14:32:05.002Z",
    "name": "allowedEmails",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "n4ncrd1b",
        "name": "email",
        "type": "email",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "exceptDomains": [],
          "onlyDomains": [
            "kmitl.ac.th"
          ]
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_aFno3js` ON `allowedEmails` (`email`)"
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("s3msmjm6s748d5h");

  return dao.deleteCollection(collection);
})
