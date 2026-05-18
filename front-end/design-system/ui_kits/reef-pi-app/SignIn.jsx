// SignIn.jsx — recreation of sign_in.jsx
function SignIn({ onLogin }) {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [bad, setBad] = React.useState(false);

  function submit(e) {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) { setBad(true); return; }
    setBad(false);
    onLogin(user);
  }

  return (
    <div id="sign-in-form" data-testid="smoke-sign-in-form">
      <form className="container-sm" onSubmit={submit}>
        <h1 className="reef-pi-title">reef-pi</h1>
        {bad && (
          <div className="alert alert-danger mb-3" role="alert">
            <strong>Oops!</strong> Invalid Credentials
          </div>
        )}
        <input
          className="form-control"
          placeholder="Username"
          value={user}
          onChange={e => setUser(e.target.value)}
          autoFocus
        />
        <input
          className="form-control"
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-lg btn-success btn-block mt-3"
          data-testid="smoke-sign-in-submit"
        >Sign In</button>
        <div className="text-muted small mt-3" style={{marginTop: 14}}>
          Demo: any username + password will sign you in.
        </div>
      </form>
    </div>
  );
}
window.SignIn = SignIn;
