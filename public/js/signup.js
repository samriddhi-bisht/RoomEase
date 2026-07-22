$(function () {
  $('#signup-form').on('submit', function (e) {
    e.preventDefault();
    $('#signup-error').text('');
    apiRequest({
      url: '/api/v1/auth/signup',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: $('#name').val(),
        email: $('#email').val(),
        phone: $('#phone').val(),
        password: $('#password').val(),
        role: $('#role').val(),
      }),
    }).done(function () {
      window.location.href = '/dashboard';
    }).fail(function (xhr) {
      $('#signup-error').text(xhr.friendlyMessage);
    });
  });
});
