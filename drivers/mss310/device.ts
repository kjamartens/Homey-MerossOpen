import Homey from 'homey';

const MerossCloud = require('../../meross/index.js');
//const MerossCloud = require('./index.js');

class MyDevice extends Homey.Device {
  private thisDevice: any;
  private options:any;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    /*this.log('MyDevice has been initialized');
    this.log("Device init");
    this.log("Name:", this.getName());
    this.log("Class:", this.getClass());
    this.log("Data:", this.getData());
    this.log("Id:", this.getData().id);*/

    this.options = {
      email: this.homey.settings.get('username'),
      password: this.homey.settings.get('password'),
      logger: console.log,
      localHttpFirst: true,
      onlyLocalForGet: true,
      timeout: 3000
    };


    this.thisDevice=[]

    //Obtain all devices
    const meross = await new MerossCloud(this.options);

    //Connect to it
    meross.connect((error:string) => {
      if (error) {
          console.log('connect error: ' + error);
      } else {
          console.log('Successfully connected to Meross devices');
      }
    });

    //Check all initialised devices
    meross.on('deviceInitialized', (deviceId: string, deviceDef: { devName: string }, device: any) => {
      
      device.on('connected', () => {

        //Logging initialised devices
        console.log('Device with name: ' + deviceDef.devName + ' and id: ' + deviceId);

        if (deviceId === this.getData().id) {
          this.thisDevice = device
        }

      });
    });


    this.registerCapabilityListener("onoff", async (value) => {
      this.log('Onoff changed to: '+value);
      setTimeout(() => {
        this.thisDevice.controlToggleX(1, value, (err:string, res:any) => {
            console.log('Toggle Response: err: ' + err + ', res: ' + JSON.stringify(res));
        });
    }, 2000);

    });
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log("MyDevice settings where changed");
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = MyDevice;
