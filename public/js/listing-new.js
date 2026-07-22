$(function () {
  $('#listing-form').on('submit', function (e) {
    e.preventDefault();
    $('#listing-error').text('');
    $('#listing-success').text('');
    const formData = new FormData(this);

    // Multipart form data (files + text fields together) can't be JSON —
    // processData/contentType false tells jQuery to leave it alone and let
    // the browser set the correct multipart boundary header itself.
    $.ajax({
      url: '/api/v1/listings',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
    }).done(function (res) {
      $('#listing-success').text('Listing published!');
      window.location.href = '/listings/' + res.listing.id;
    }).fail(function (xhr) {
      $('#listing-error').text((xhr.responseJSON && xhr.responseJSON.error) || 'Could not publish listing.');
    });
  });
});
