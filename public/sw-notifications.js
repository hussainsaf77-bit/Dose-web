// Custom notification action handler imported by the VitePWA service worker
self.addEventListener('notificationclick', function (event) {
  var notification = event.notification;
  var action = event.action || 'open';
  var data = notification && notification.data ? notification.data : {};

  notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      var payload = {
        type: 'DOSE_NOTIFICATION_ACTION',
        action: action,
        remId: data.remId || '',
        scheduledTime: data.scheduledTime || '',
        slotKey: data.slotKey || '',
        snoozeCount: typeof data.snoozeCount === 'number' ? data.snoozeCount : 0,
        drugName: data.drugName || '',
      };

      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          client.focus();
          client.postMessage(payload);
          return;
        }
      }

      if (self.clients.openWindow) {
        var params = new URLSearchParams();
        params.set('notif_action', action);
        if (payload.remId) params.set('rem_id', payload.remId);
        if (payload.scheduledTime) params.set('sched', payload.scheduledTime);
        return self.clients.openWindow('/#reminders?' + params.toString());
      }
    })
  );
});
