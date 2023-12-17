// document.addEventListener('DOMContentLoaded', function () {
//   const messageButton = document.getElementById('messageButton');

//   messageButton.addEventListener('click', function () {
//     console.log('Kliknuto na gumb za poruku!');
//     sendMessage();
//   });

//   function sendMessage() {
//     const messageText = document.getElementById('messageInput').value;

//     if (!messageText) {
//       alert('Unesite poruku.');
//       return;
//     }

//     const messageData = {
//       messageText: messageText,
//     };

//     fetch('/messages', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(messageData),
//     })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log('Server response:', data);
//         // Ovdje možete dodati dodatnu logiku ili ažurirati korisničko sučelje
//       })
//       .catch(error => {
//         console.error('There was a problem with the fetch operation:', error);
//       });
//   }
// });


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

const main = async () => {
  checkPermission()
  await requestNotificationPermission()
  await registerSW()
}

main()