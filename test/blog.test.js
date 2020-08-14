const Page = require("./helpers/customPage");

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000");
});

afterEach(async () => {
    await page.close()
});


describe("when logged in", async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });
    test('should see blog creation form ', async () => {
        const label = await page.getContentsOf("form label");
        expect(label).toEqual("Blog Title")
    });

    describe("when invalid inputs are used", async () => {
        beforeEach(async () => {
            await page.click('form button');
        });
        test('should see an error on the form ', async () => {
            const contentError = await page.getContentsOf(".content .red-text");
            const titleError = await page.getContentsOf(".title .red-text")
            expect(contentError).toEqual("You must provide a value")
            expect(titleError).toEqual("You must provide a value")
        });
    });
    

    describe("when valid inputs are used", async () => {
        beforeEach(async () => {
            await page.type(".title input", "My title");
            await page.type(".content input", "My content");
            await page.click('form button');

        });
        test('should see review screen when submitted ', async () => {
            const text = await page.getContentsOf("form h5");
            expect(text).toEqual("Please confirm your entries")
        });

        test('should see blog page when submitted ', async () => {
            await page.click('button.green');
            await page.waitFor(".card");
            const title = await page.getContentsOf(".card-title");
            const content = await page.getContentsOf("p");

            expect(title).toEqual("My title")
            expect(content).toEqual("My content")
        });
    });
});


describe("When not logged in", async () => {
    test("should not create new blog post", async () => {
        const result = await page.post("/api/blogs", {title: "My title", content: "My content"})

        expect(result).toEqual({error: "You must log in!"})
    });

    test("should not list of blog posts", async () => {
        const result = await page.get("/api/blogs");
        expect(result).toEqual({error: "You must log in!"})
    });
});