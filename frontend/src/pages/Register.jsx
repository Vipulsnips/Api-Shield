function Singup() {
  return (
    <div>
      <form
        action="https://api-shield-1e4k.onrender.com/api/auth/signup"
        method="post"
      >
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        <label htmlFor="password">password</label>
        <input id="password" name="password" type="password" />
      </form>
      <button type="submit">SignUp</button>
    </div>
  );
}
export default Singup;
