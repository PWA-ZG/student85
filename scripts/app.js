document.addEventListener('DOMContentLoaded', function () {
  const animationContainer = document.getElementById('animationContainer');

  if ('animation' in document.createElement('div').style) {
    animateElement(animationContainer);
  }
});

function animateElement(element) {
  element.classList.add('animate');
}


document.addEventListener('DOMContentLoaded', function () {
  const reminderButton = document.getElementById('reminderButton');
  
  reminderButton.addEventListener('click', function () {
    console.log('Kliknuto!');
    setReminder();
  });

  function setReminder() {
    const reminderText = document.getElementById('reminderInput').value;
    const reminderTime = document.getElementById('timeInput').value;

    if (!reminderText || !reminderTime) {
      alert('Unesite podsjetnik i vrijeme.');
      return;
    }

    const reminderData = {
      reminderText: reminderText,
      reminderTime: reminderTime,
    };

    fetch('/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminderData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Server response:', data);
        location.reload();
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

});


const checkPermission = () => {
  if (!('serviceWorker' in navigator)) {
      throw new Error("No support for service worker!")
  }

  if (!('Notification' in window)) {
    throw new Error("No support for notification API");
}

if (!('PushManager' in window)) {
  throw new Error("No support for Push API")
}

}

const registerSW = async () => {
  const registration = await navigator.serviceWorker.register('service-worker.js');
  return registration;
}

const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
      throw new Error("Notification permission not granted")
  }

}
const animacije=  () => {
const supportsCSSAnimations = window.CSS && window.CSS.supports && window.CSS.supports('animation: test 0s');

const supportsWebAnimationsAPI = 'animate' in document.createElement('div');

if (supportsCSSAnimations) {
  console.log('Preglednik podržava CSS animacije.');
} else {
  console.log('Preglednik ne podržava CSS animacije.');
}

if (supportsWebAnimationsAPI) {
  console.log('Preglednik podržava Web Animations API.');
} else {
  console.log('Preglednik ne podržava Web Animations API.');
}
}
const main = async () => {
  animacije()
  checkPermission()
  await requestNotificationPermission()
  await registerSW()
}
main()