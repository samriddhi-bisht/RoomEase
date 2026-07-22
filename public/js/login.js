$(function () {
  $('#login-form').on('submit', function (e) {
    e.preventDefault();
    $('#login-error').text('');
    apiRequest({
      url: '/api/v1/auth/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email: $('#email').val(), password: $('#password').val() }),
    }).done(function () {
      window.location.href = '/dashboard';
    }).fail(function (xhr) {
      $('#login-error').text(xhr.friendlyMessage);
    });
  });
});
