const Page = require("./helpers/customPage");

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000");
    console.log("page header",page.url())

});

afterEach(async () => {
    await page.close()
})

test("check if header test is correct", async () => {
  
  const text = await page.getContentsOf("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("click login starts oauth flow", async () => {
    await page.waitFor('.right li a');
    await page.click('.right li a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
  });

test('show logout button when signed in', async () => {
    await page.login();
    const text = await page.getContentsOf("a[href='/auth/logout']");
    expect(text).toEqual("Logout");

})

