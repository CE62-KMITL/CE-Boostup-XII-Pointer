package main

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"os"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

type Staff struct {
	FullNameEN      string `json:"fullName_en"`
	EmailUniversity string `json:"email_university"`
}

func main() {
	app := pocketbase.New()

	jsonFile, err := os.Open("staffs-data.secret.json")
	if err != nil {
		log.Fatal(err)
	}
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)
	var staffs []Staff
	json.Unmarshal(byteValue, &staffs)

	staffMap := make(map[string]Staff)
	for _, staff := range staffs {
		staffMap[staff.EmailUniversity] = staff
	}

	app.OnRecordBeforeAuthWithOAuth2Request("users").Add(func(e *core.RecordAuthWithOAuth2Event) error {
		if e.IsNewRecord {
			if _, ok := staffMap[e.OAuth2User.Email]; ok {
				return nil
			}
			return errors.New("you are not allowed to login to this system")
		}
		return nil
	})

	app.OnRecordAfterAuthWithOAuth2Request("users").Add(func(e *core.RecordAuthWithOAuth2Event) error {
		if e.IsNewRecord {
			if staff, ok := staffMap[e.OAuth2User.Email]; ok {
				_, err := app.Dao().DB().NewQuery("UPDATE `users` SET `username`={:username}, `emailVisibility`=true WHERE `id`={:id}").Bind(dbx.Params{
					"id":       e.Record.Id,
					"username": strings.ReplaceAll(staff.FullNameEN, " ", "_"),
				}).Execute()

				if err != nil {
					log.Fatal(err)
				}
			} else {
				_, err := app.Dao().DB().NewQuery("UPDATE `users` SET `emailVisibility`=true WHERE `id`={:id}").Bind(dbx.Params{
					"id": e.Record.Id,
				}).Execute()

				if err != nil {
					log.Fatal(err)
				}
			}
		}

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
