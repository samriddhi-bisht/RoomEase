$(function () {
  function loadMyProfile() {
    apiRequest({ url: '/api/v1/roommates/profile/me', method: 'GET' }).done(function (res) {
      if (!res.profile) return;
      $('#collegeId').val(res.profile.college_id || '');
      $('#budgetMin').val(res.profile.budget_min || '');
      $('#budgetMax').val(res.profile.budget_max || '');
      $('#habits').val(res.profile.habits || '');
      $('#bio').val(res.profile.bio || '');
    });
  }

  $('#profile-form').on('submit', function (e) {
    e.preventDefault();
    $('#profile-error').text('');
    $('#profile-success').text('');
    const data = {
      collegeId: $('#collegeId').val() || null,
      budgetMin: $('#budgetMin').val() || null,
      budgetMax: $('#budgetMax').val() || null,
      habits: $('#habits').val(),
      bio: $('#bio').val(),
    };
    apiRequest({ url: '/api/v1/roommates/profile', method: 'PUT', contentType: 'application/json', data: JSON.stringify(data) })
      .done(function () { $('#profile-success').text('Profile saved.'); })
      .fail(function (xhr) { $('#profile-error').text(xhr.friendlyMessage); });
  });

  function renderProfile(p) {
    return (
      '<div class="card"><div class="card-body">' +
        '<div class="card-title">' + escapeHtml(p.user_name) + '</div>' +
        '<div class="card-meta">' + escapeHtml(p.college_name || 'No college set') + '</div>' +
        '<p>' + escapeHtml(p.bio || 'No bio yet.') + '</p>' +
        '<button class="btn-pill small connect-btn" data-user="' + p.user_id + '">Connect</button>' +
      '</div></div>'
    );
  }

  function loadBrowse() {
    apiRequest({ url: '/api/v1/roommates/browse', method: 'GET' })
      .done(function (res) {
        $('#roommate-results').html(
          res.profiles.length
            ? '<div class="grid">' + res.profiles.map(renderProfile).join('') + '</div>'
            : '<div class="empty-state">No other profiles yet.</div>'
        );
        $('.connect-btn').on('click', function () {
          const receiverId = $(this).data('user');
          const $btn = $(this);
          apiRequest({
            url: '/api/v1/connections',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ receiverId }),
          }).done(function () {
            $btn.text('Request sent').prop('disabled', true);
          }).fail(function (xhr) {
            alert(xhr.friendlyMessage);
          });
        });
      })
      .fail(function (xhr) {
        $('#roommate-results').html('<div class="empty-state">' + escapeHtml(xhr.friendlyMessage) + '</div>');
      });
  }

  loadMyProfile();
  loadBrowse();
});
