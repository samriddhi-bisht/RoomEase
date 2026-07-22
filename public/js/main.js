$(function () {
  $('#logout-link').on('click', function (e) {
    e.preventDefault();
    $.ajax({ url: '/api/v1/auth/logout', method: 'POST' }).always(function () {
      window.location.href = '/login';
    });
  });
});

// Every page script calls this instead of $.ajax directly, so failed
// requests get a consistent, readable message pulled from our API's
// { error: "..." } response shape instead of a raw status code.
function apiRequest(options) {
  return $.ajax(options).fail(function (xhr) {
    xhr.friendlyMessage = (xhr.responseJSON && xhr.responseJSON.error) || 'Something went wrong.';
  });
}

function starString(rating) {
  const rounded = Math.round(rating || 0);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

// Every place we drop user-supplied text into an HTML string (listing
// titles, bios, review comments...) goes through this first — otherwise a
// title like "<script>..." would execute in every visitor's browser.
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
