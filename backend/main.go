package main

import (
	"backend/internal"
	"database/sql"
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	dbDns := "./db/sqlite3.db"
	err := internal.NewDB(dbDns)
	db := internal.StartSQLite(dbDns)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.POST("/devices", func(context *gin.Context) {
		var device internal.DeviceProps

		if err := context.ShouldBindJSON(&device); err != nil {
			context.IndentedJSON(400, gin.H{"error": "Invalid request body", "details": err.Error()})
			return
		}

		// Set default status and lastChecked if not provided
		if device.Status == "" {
			device.Status = internal.DeviceStatusOffline
		}
		if device.LastChecked == "" {
			device.LastChecked = time.Now().Format("15:04")
		}

		// Validate required fields
		if device.Name == "" || device.IPAddress == "" || device.Type == "" {
			context.IndentedJSON(400, gin.H{"error": "Missing required fields: name, ipAddress, type"})
			return
		}

		// Create device in database
		if err := internal.CreateDevice(db, device); err != nil {
			context.IndentedJSON(500, gin.H{"error": "Failed to create device", "details": err.Error()})
			return
		}

		context.IndentedJSON(201, gin.H{"message": "Device created successfully", "device": device})
	})

	r.GET("/devices", func(context *gin.Context) {
		devices, err := internal.GetDevices(db)
		if err != nil {
			context.IndentedJSON(400, "couldnt retrieve devices")
			return
		}
		context.IndentedJSON(200, devices)
	})

	r.DELETE("/device", func(context *gin.Context) {
		deviceId := context.Query("id")
		err := internal.DeleteDevice(db, deviceId)
		if err != nil {
			context.IndentedJSON(404, "couldnt find device to delete")
		}
		message := fmt.Sprintf("device with id: %s Successfully deleted", deviceId)
		context.IndentedJSON(200, message)
	})

	//go taskRunner(db)

	err = r.Run()
	if err != nil {
		panic(err)
	}

	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			fmt.Printf("failed to close db")
		}
	}(db)
}

func taskRunner(db *sql.DB) {
	ticker := time.NewTicker(10 * time.Second)
	for range ticker.C {
		internal.AvailabilityCheck(db)
	}
}
