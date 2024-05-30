/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("s3msmjm6s748d5h")

  collection.name = "allowed_emails"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_aFno3js` ON `allowed_emails` (`email`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("s3msmjm6s748d5h")

  collection.name = "allowedEmails"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_aFno3js` ON `allowedEmails` (`email`)"
  ]

  return dao.saveCollection(collection)
})
