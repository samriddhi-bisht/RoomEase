$(function () {
  const role = $('main').data('role');

  function badgeClass(status) { return 'badge badge-' + status; }

  function loadMe() {
    return apiRequest({ url: '/api/v1/auth/me', method: 'GET' }).done(function (res) {
      $('#kyc-badge').html(
        '<span class="' + badgeClass(res.user.kyc_status) + '">KYC: ' + res.user.kyc_status.replace('_', ' ') + '</span>'
      );
    });
  }

  function renderOwnerListing(l) {
    const statusBadge = '<span class="' + badgeClass(l.status) + '">' + l.status + '</span>';
    return (
      '<div class="card">' +
        '<img class="card-img" src="' + ((l.images && l.images[0]) || '/img/placeholder.svg') + '" alt="" />' +
        '<div class="card-body">' +
          '<div class="card-title">' + escapeHtml(l.title) + '</div>' +
          '<div class="card-footer"><span class="card-rent">₹' + l.rent + '/mo</span>' + statusBadge + '</div>' +
          '<div class="chip-row" style="margin-top:0.5rem;">' +
            '<button class="btn-pill small outline toggle-status" data-id="' + l.id + '" data-current="' + l.status + '">' +
              (l.status === 'active' ? 'Deactivate' : 'Activate') +
            '</button>' +
            '<button class="btn-pill small danger delete-listing" data-id="' + l.id + '">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function loadOwnerDashboard() {
    apiRequest({ url: '/api/v1/listings/mine', method: 'GET' }).done(function (res) {
      const html = res.listings.length
        ? '<div class="grid">' + res.listings.map(renderOwnerListing).join('') + '</div>'
        : '<div class="empty-state">No listings yet. <a href="/listings/new">Create your first one</a>.</div>';
      $('#dashboard-content').html(
        '<div class="section-title"><h3>My listings</h3><a href="/listings/new" class="btn-pill small">+ New listing</a></div>' + html
      );

      $('.toggle-status').on('click', function () {
        const id = $(this).data('id');
        const next = $(this).data('current') === 'active' ? 'deactivate' : 'activate';
        apiRequest({ url: '/api/v1/listings/' + id + '/' + next, method: 'PATCH' }).done(loadOwnerDashboard);
      });
      $('.delete-listing').on('click', function () {
        if (!confirm('Delete this listing?')) return;
        const id = $(this).data('id');
        apiRequest({ url: '/api/v1/listings/' + id, method: 'DELETE' }).done(loadOwnerDashboard);
      });
    });
  }

  function renderConnection(c, myId) {
    const otherName = c.requester_id === myId ? c.receiver_name : c.requester_name;
    const isIncoming = c.receiver_id === myId && c.status === 'pending';
    let actions = '';
    if (isIncoming) {
      actions =
        '<button class="btn-pill small respond" data-id="' + c.id + '" data-decision="accepted">Accept</button> ' +
        '<button class="btn-pill small outline respond" data-id="' + c.id + '" data-decision="rejected">Reject</button>';
    }
    return (
      '<div class="review">' +
        '<strong>' + escapeHtml(otherName) + '</strong> — <span class="' + badgeClass(c.status) + '">' + c.status + '</span>' +
        '<div>' + actions + '</div>' +
      '</div>'
    );
  }

  function loadStudentDashboard(myId) {
    $('#dashboard-content').html(
      '<div class="form-card wide"><h3>Roommate profile</h3><div id="profile-summary"><p>Loading…</p></div>' +
      '<a href="/roommates" class="btn-pill small">Edit / browse roommates</a></div>' +
      '<div class="form-card wide" style="margin-top:1.5rem;"><h3>Connections</h3><div id="connections-list"><p>Loading…</p></div></div>'
    );

    apiRequest({ url: '/api/v1/roommates/profile/me', method: 'GET' }).done(function (res) {
      if (!res.profile) {
        $('#profile-summary').html('<p>You haven’t set up a roommate profile yet.</p>');
      } else {
        $('#profile-summary').html(
          '<p>' + escapeHtml(res.profile.bio || 'No bio yet.') + '</p>' +
          '<p class="card-meta">Budget: ₹' + (res.profile.budget_min || '?') + ' - ₹' + (res.profile.budget_max || '?') + '</p>'
        );
      }
    });

    apiRequest({ url: '/api/v1/connections', method: 'GET' }).done(function (res) {
      if (!res.connections.length) {
        $('#connections-list').html('<p>No connections yet.</p>');
        return;
      }
      $('#connections-list').html(res.connections.map((c) => renderConnection(c, myId)).join(''));
      $('.respond').on('click', function () {
        const id = $(this).data('id');
        const decision = $(this).data('decision');
        apiRequest({
          url: '/api/v1/connections/' + id + '/respond',
          method: 'PATCH',
          contentType: 'application/json',
          data: JSON.stringify({ decision }),
        }).done(function () { loadStudentDashboard(myId); });
      });
    });
  }

  loadMe().done(function (res) {
    if (role === 'owner') loadOwnerDashboard();
    else if (role === 'student') loadStudentDashboard(res.user.id);
    else $('#dashboard-content').html('<p>Go to the <a href="/admin">Admin panel</a> to manage KYC approvals and listings.</p>');
  });
});
