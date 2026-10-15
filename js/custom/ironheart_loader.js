// Ironheart loader auto-hide
(function () {
  function hideLoader() {
    var l = document.getElementById('ironheart-loader');
    if (l) l.classList.add('hidden');
  }
  if (document.readyState !== 'loading') {
    setTimeout(hideLoader, 1500);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(hideLoader, 1500);
    });
  }
  setTimeout(hideLoader, 4000);
  document.addEventListener('pjax:complete', function () {
    setTimeout(hideLoader, 500);
  });
})();
