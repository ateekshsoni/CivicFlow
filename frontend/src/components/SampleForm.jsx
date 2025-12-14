const SampleForm = () => {
  return (
    <div>
      <h2>Sample Form</h2>
      <form>
        <label>Name:</label>
        <input type="text" name="name" />
        <br />
        <label>Email:</label>
        <input type="email" name="email" />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SampleForm;
