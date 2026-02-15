package internal

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type IconType string

const (
	IconTypeVM      IconType = "VM"
	IconTypeLXC     IconType = "LXC"
	IconTypeDevice  IconType = "Device"
	IconTypeNetwork IconType = "Network"
)

type DeviceStatus string

const (
	DeviceStatusOnline  DeviceStatus = "online"
	DeviceStatusOffline DeviceStatus = "offline"
)

type DeviceProps struct {
	ID          int          `json:"id"`
	Name        string       `json:"name"`
	Type        IconType     `json:"type"`
	Status      DeviceStatus `json:"status"`
	IPAddress   string       `json:"ipAddress"`
	Service     string       `json:"service"`
	Port        int          `json:"port"`
	Domain      *string      `json:"domain,omitempty"`
	LastChecked string       `json:"lastChecked"`
}

func NewDB(dsn string) error {
	if dsn == "" {
		dsn = "./db/sqlite3.db"
	}

	dir := filepath.Dir(dsn)
	err := os.MkdirAll(dir, 0755)
	if err != nil {
		return fmt.Errorf("failed to create database directory: %w", err)
	}

	absPath, err := filepath.Abs(dsn)
	if err != nil {
		return fmt.Errorf("failed to get absolute path: %w", err)
	}

	db, err := sql.Open("sqlite3", absPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	err = db.Ping()
	if err != nil {
		defer func(db *sql.DB) {
			err := db.Close()
			if err != nil {
				log.Printf("failed to close database: %v", err)
			}
		}(db)
		return fmt.Errorf("failed to ping database: %w", err)
	}

	return nil
}

func StartSQLite(dns string) *sql.DB {
	if dns == "" {
		dns = "/db/sqlite3.db"
	}

	fmt.Printf("Checking Database Location at: %s...\n", dns)

	db, err := sql.Open("sqlite3", dns)
	if err != nil {
		fmt.Printf("error opening sqlite db: %s \n", err)
	}

	sqlStatement := `CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY,
    name TEXT,
    type TEXT,
    status TEXT,
    ipAddress TEXT,
    service TEXT,
    port integer,
    domain TEXT,
    lastChecked TEXT
    
)`
	_, err = db.Exec(sqlStatement)
	if err != nil {
		fmt.Printf("error creating database tables %s \n", err)
	}

	return db
}

func CreateDevice(db *sql.DB, data DeviceProps) error {
	stmt, err := db.Prepare("INSERT INTO devices(name, type, status, ipAddress, service, port, domain, lastChecked) VALUES(?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("error preparing statement: %w", err)
	}
	defer func(stmt *sql.Stmt) {
		err := stmt.Close()
		if err != nil {
			fmt.Println("error failed to close db prep. this could indicate a memory leak")
		}
	}(stmt)

	domain := ""
	if data.Domain != nil {
		domain = *data.Domain
	}

	_, err = stmt.Exec(data.Name, data.Type, data.Status, data.IPAddress, data.Service, data.Port, domain, data.LastChecked)
	if err != nil {
		return fmt.Errorf("error inserting device: %w", err)
	}

	return nil
}

func GetDevices(db *sql.DB) ([]DeviceProps, error) {
	rows, err := db.Query("SELECT id, name, type, status, ipAddress, service, port, domain, lastChecked FROM devices")
	if err != nil {
		return nil, fmt.Errorf("error querying devices: %w", err)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			fmt.Println("error failed to close rows. this could indicate a memory leak")
		}
	}(rows)

	var devices []DeviceProps

	for rows.Next() {
		var device DeviceProps
		var domain sql.NullString

		err := rows.Scan(&device.ID, &device.Name, &device.Type, &device.Status, &device.IPAddress, &device.Service, &device.Port, &domain, &device.LastChecked)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}

		if domain.Valid {
			device.Domain = &domain.String
		}

		devices = append(devices, device)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return devices, nil
}

func UpdateDevice(availability string, time string, id int, db *sql.DB) error {
	sqlStatement := `UPDATE devices SET status = ?, lastChecked = ? WHERE id = ?`

	_, err := db.Exec(sqlStatement, availability, time, id)
	if err != nil {
		message := fmt.Sprintf("Update of device with id: %v failed", id)
		fmt.Println(message)
		return err
	}
	return nil
}

func DeleteDevice(db *sql.DB, id string) error {
	sqlStatement := `DELETE FROM devices WHERE id = ?`
	_, err := db.Exec(sqlStatement, id)
	if err != nil {
		return err
	}
	return nil
}
