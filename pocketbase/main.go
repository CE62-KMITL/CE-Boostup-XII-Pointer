package main

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"os"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

type Staff struct {
	NicknameTH      string `json:"nickName_th"`
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
				e.Record.SetUsername(strings.ReplaceAll(staff.FullNameEN, " ", "_"))
				e.Record.Set("nickname", "พี่"+staff.NicknameTH)
				e.Record.SetEmailVisibility(true)

				if err := app.Dao().SaveRecord(e.Record); err != nil {
					log.Fatal(err)
				}
			} else {
				e.Record.SetEmailVisibility(true)

				if err := app.Dao().SaveRecord(e.Record); err != nil {
					log.Fatal(err)
				}
			}
		}

		return nil
	})

	app.OnRecordAfterUpdateRequest("participants").Add(func(e *core.RecordUpdateEvent) error {
		groupRecord, err := app.Dao().FindRecordById("groups", e.Record.GetString("group"))
		if err != nil {
			log.Fatal(err)
		} else {
			groupRecord.Set("updateCount", groupRecord.GetInt("updateCount")+1)

			if err := app.Dao().SaveRecord(groupRecord); err != nil {
				log.Fatal(err)
			}
		}

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
