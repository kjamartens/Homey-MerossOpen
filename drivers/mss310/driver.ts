import Homey from 'homey';

const MerossCloud = require('../../meross/index.js');
//const MerossCloud = require('./index.js');


function sleep(ms:any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class MyDriver extends Homey.Driver {

  private currentDevices: any;
  private deviceInitializedPromises: any; // Store promises for each device initialization
  private meross: any;
  private options: any;

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');

    
    this.options = {
      email: this.homey.settings.get('username'),
      password: this.homey.settings.get('password'),
      logger: console.log,
      localHttpFirst: true,
      onlyLocalForGet: true,
      timeout: 3000
    };

  }



  private async initializeDevices(options: any) {
    console.log('init devices called')
    this.meross = await new MerossCloud(options);
    
    //Create a promise to wait for the connection
    const connectPromise = new Promise<void>((resolve, reject) => {
      this.meross.connect((error: string) => {
        if (error) {
          reject(error);
        } else {
          console.log('connected')
          resolve();
        }
      });
    });

    // Return a promise that resolves when all devices are initialized
    //resolve();
    //return Promise.all(devicePromises);
  }

  private async handleDeviceInitialization(deviceId: string, deviceDef: { devName: string, deviceType: string, uuid: string }, device: any) {
    return new Promise<void>((resolve) => {
      device.on('connected', () => {
        // Handle device initialization
        if (deviceDef.deviceType === "mss310") {
          this.currentDevices.push({
            name: deviceDef.devName,
            data: {
              id: deviceId,
            },
          });
          console.log('MSS310 found');
          console.log(this.currentDevices);
        } else {
          console.log('Device not MSS310');
        }
        resolve(); // Resolve the promise when the device is initialized
      });
    });
  }


  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
      this.currentDevices = [];
      this.deviceInitializedPromises = [];
      this.log('onpairlistdevices called');
      
      
    try {
      await this.initializeDevices(this.options);



      // Handle device initialization
      this.meross.on('deviceInitialized', async (deviceId: string, deviceDef: { devName: string, deviceType: string, uuid: string }, device: any) => {
        await this.handleDeviceInitialization(deviceId, deviceDef, device);
      });

      // Wait for all devices to be initialized
      await Promise.all(this.deviceInitializedPromises);


      //Since nothing works, I just wait 10 seconds
      await sleep(10000);

      // All devices have been initialized
      this.log('All devices initialized');

      console.log(this.currentDevices);
      return this.currentDevices;
    } catch (error) {
      console.error('Device initialization error: ' + error);
      return [];
    }
    /*
      //Obtain all devices
      const meross = await new MerossCloud(options);

      //Create a promise to wait for the connection
      const connectPromise = new Promise<void>((resolve, reject) => {
        meross.connect((error: string) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      
      // Push the connectPromise to the deviceInitializedPromises array
      this.deviceInitializedPromises.push(connectPromise);

      //Check all initialised devices
      meross.on('deviceInitialized', (deviceId: string, deviceDef: { devName: string, deviceType: string, uuid: string }, device: any) => {
        const deviceInitializedPromise = new Promise<void>((resolve) => {
          device.on('connected', () => {
            //Logging initialised devices
            console.log('Device with name: ' + deviceDef.devName + ' and id: ' + deviceId);
            console.log('FulldeviceDef: ' + JSON.stringify(deviceDef));

            if (deviceDef.deviceType == "mss310") {
              this.currentDevices.push({
                name: deviceDef.devName,
                data: {
                  id: deviceId,
                },
              });
              console.log('MSS310 found');
              console.log(this.currentDevices);
            } else {
              console.log('Device not MSS310');
            }

            resolve(); // Resolve the promise when the device is initialized
          });
        });

        this.deviceInitializedPromises.push(deviceInitializedPromise);
      });

      //Wait for all devices to be initialized
      try {
        await Promise.all(this.deviceInitializedPromises); // Wait for all device promises to resolve
        this.log('All devices initialized');
        console.log(this.currentDevices);
        return this.currentDevices; // Return the devices after all have been initialized
      } catch (error) {
        console.error('Device initialization error: ' + error);
        return []; // or handle the error in a different way
      }*/
  }

}

module.exports = MyDriver;