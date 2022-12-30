/* eslint-disable no-console */

import type { IHomebridgePluginUi, IHomebridgeUiFormHelper } from '@homebridge/plugin-ui-utils/dist/ui.interface';
declare const homebridge: IHomebridgePluginUi;

//Intro Elements
const pageIntro = document.getElementById('pageIntro') as HTMLDivElement;
const introContinue = document.getElementById('introContinue') as HTMLButtonElement;
//Settings Elements
const menuSettings = document.getElementById('menuSettings') as HTMLButtonElement;
const settingsHelp = document.getElementById('settingsHelp') as HTMLParagraphElement;
//Devices Elements
const menuDevices = document.getElementById('menuDevices') as HTMLButtonElement;
const pageDevices = document.getElementById('pageDevices') as HTMLDivElement;
const deviceAdd = document.getElementById('deviceAdd') as HTMLButtonElement;
const exitAddDevice = document.getElementById('exitAddDevice') as HTMLButtonElement;
let currentForm: IHomebridgeUiFormHelper;

//Miscellaneous Elements
const menuWrapper = document.getElementById('menuWrapper') as HTMLDivElement;
(async () => {
  try {
    const currentConfig = await homebridge.getPluginConfig();
    const showIntro = () => {
      introContinue.addEventListener('click', () => {
        homebridge.showSpinner();
        pageIntro.style.display = 'none';
        menuWrapper.style.display = 'inline-flex';
        showSettings();
        homebridge.hideSpinner();
      });
      pageIntro.style.display = 'block';
    };
    const showDevices = async () => {
      homebridge.showSpinner();
      menuWrapper.style.display = 'inline-flex';
      menuDevices.classList.add('btn-elegant');
      menuDevices.classList.remove('btn-primary');
      menuSettings.classList.remove('btn-elegant');
      menuSettings.classList.add('btn-primary');
      pageDevices.style.display = 'block';
      homebridge.hideSchemaForm();
      settingsHelp.style.display = 'none';
      currentForm?.end();
      exitAddDevice.style.display = 'none';
      homebridge.hideSpinner();
    };
    const showSettings = () => {
      homebridge.showSpinner();
      menuWrapper.style.display = 'inline-flex';
      menuDevices.classList.remove('btn-elegant');
      menuDevices.classList.add('btn-primary');
      menuSettings.classList.add('btn-elegant');
      menuSettings.classList.remove('btn-primary');
      pageDevices.style.display = 'none';
      homebridge.showSchemaForm();
      settingsHelp.style.display = 'block';
      currentForm?.end();
      exitAddDevice.style.display = 'none';
      homebridge.hideSpinner();
    };
    const showAddDevices = () => {
      homebridge.showSpinner();
      menuWrapper.style.display = 'none';
      homebridge.hideSchemaForm();
      settingsHelp.style.display = 'none';
      pageDevices.style.display = 'none';
      currentForm?.end();
      exitAddDevice.style.display = 'inline';
      homebridge.hideSpinner();
      // create the form
      currentForm = homebridge.createForm(
        {
          schema: {
            type: 'object',
            properties: {
              email: {
                title: 'Email',
                type: 'string',
                required: true,
                format: 'email',
              },
              password: {
                title: 'Password',
                type: 'string',
                required: true,
                'x-schema-form': {
                  type: 'password',
                },
              },
            },
          },
          layout: null,
          form: null,
        },
        {}, 'Get Devices', 'Configure Manually',
      );

      // watch for submit button click events
      currentForm.onSubmit((form) => {
        console.log(form);
        showDevices();
      });
      // watch for cancel button click events
      currentForm.onCancel(() => {
        homebridge.showSpinner();
        currentForm.end();
        currentForm = homebridge.createForm(
          {
            schema: {
              type: 'object',
              properties: {
                devices: {
                  title: 'Devices',
                  type: 'array',
                  buttonText: 'Add Device',
                  items: {
                    type: 'object',
                    properties: {
                      ip: {
                        title: 'IP Address',
                        type: 'string',
                        format: 'ipv4',
                        required: true,
                      },
                      blid: {
                        title: 'Blid',
                        type: 'string',
                        description: 'Your devices blid, if you don\'t know, leave blank.',
                      },
                      password: {
                        title: 'Password',
                        type: 'string',
                        description: 'Your devices blid, if you don\'t know, leave blank.',
                        minLength: 7,
                      },
                      ready: {
                        title: 'I have pressed and held the HOME button on my robot until it played a series of tones (about 2 seconds).',
                        description: 'Required to get your device\'s password',
                        type: 'boolean',
                        condition: {
                          functionBody: 'return !model.devices[arrayIndices].password',
                        },
                      },
                    },
                  },
                },
              },
            },
            layout: null,
            form: null,
          },
          {}, 'Get Devices', 'Configure From Cloud',
        );

        // watch for submit button click events
        currentForm.onSubmit((form) => {
          console.log(form);
          showDevices();
        });
        // watch for cancel button click events
        currentForm.onCancel(() => {
          showAddDevices();
        });
        homebridge.hideSpinner();
      });
      homebridge.hideSpinner();
    };
    menuDevices.addEventListener('click', () => showDevices());
    menuSettings.addEventListener('click', () => showSettings());
    deviceAdd.addEventListener('click', () => showAddDevices());
    exitAddDevice.addEventListener('click', () => showDevices());

    if (currentConfig.length) {
      showSettings();
    } else {
      currentConfig.push({ name: 'iRobot' });
      await homebridge.updatePluginConfig(currentConfig);
      showIntro();
    }
  } catch (err) {
    homebridge.toast.error(err, 'Error');
    console.error(err);
    homebridge.closeSettings();
  } finally {
    homebridge.hideSpinner();
  }
})();