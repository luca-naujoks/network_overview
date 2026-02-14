package internal

import (
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/prometheus-community/pro-bing"
)

// Return true when IP is available returns false when not reachable
func scanIP(ip string, wg *sync.WaitGroup) bool {
	defer wg.Done()

	pinger, err := probing.NewPinger(ip)
	if err != nil {
		fmt.Printf("Failed to ping IP %s: %v\n", ip, err)
		return false
	}
	// send only one ping
	pinger.Count = 1
	// set timeout for the ping
	pinger.Timeout = time.Second * 3

	pinger.SetPrivileged(false)

	err = pinger.Run() // start the ping
	if err != nil {
		fmt.Printf("Failed to ping IP %s: %v\n", ip, err)
		return false
	}

	stats := pinger.Statistics() // get ping statistics
	if stats.PacketsRecv > 0 {
		fmt.Printf("IP %s is up\n", ip)
		return true
	}
	return false
}

func AvailabilityCheck(db *sql.DB) {
	var wg sync.WaitGroup

	devices, err := GetDevices(db)
	if err != nil {
		fmt.Println("error retrieving devices from database")
	}

	for _, device := range devices {
		wg.Add(1)
		go func() {
			currentTime := time.Now().Add(1 * time.Hour).Format("15:04")
			isAvailable := scanIP(device.IPAddress, &wg)
			if isAvailable {
				_ = UpdateDevice("online", currentTime, device.ID, db)
			} else {
				_ = UpdateDevice("offline", currentTime, device.ID, db)
			}
		}()
	}

	wg.Wait()
	fmt.Println("Device availability check completed")
}
