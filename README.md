# HomeyMerossOpen

## This is a very, very bad implementation of Meross devices for Homey. Use at your own risk and with your own knowledge. Created in a few hours on 21.01.2024. Really, assume this is pre-pre-pre alpha build.

General use:
* Clone this repository so you have the files
* Install Homey CLI: https://apps.developer.homey.app/the-basics/getting-started/homey-cli
* Run or install to Homey via 'homey app run' (or 'homey app install')
* Go to the app settings, enter your Meross user/pass
* Add a device - only MSS310 is supported. Feel free to change/add/pull/fork whatever.

Known issues:
* Only MSS310 supported, only onoff supported
* Slow to respond
* Doesn't update from changes within Meross app.

Developer notes:
* Based on https://www.npmjs.com/package/meross-cloud
* I couldn't get awaiting working in driver/onPairListDevices, so we're just waiting for 10 seconds now. Terrible implementation, but works.
* General strategy to extend to more devices: Create a new folder in /drives/ (or use Homey CLI homey app driver create) 
	* In device.ts, only change lines 60-66 (this.registerCapabilityListener("onoff", async (value) => {) to do something else
	* in driver.ts, line 63 ("(deviceDef.deviceType === "mss310")") ensures that only mss310 devices are found, or whatever device you want.