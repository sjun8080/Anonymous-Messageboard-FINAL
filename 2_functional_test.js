
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { Thread, getThreadId, getReplyId } = require("../model/messageBoard");

chai.use(chaiHttp);

const threadPostData = { board: "test", text: "test", delete_password: "test" };
const replyData = { text: "test", delete_password: "test", board: "test" };

suite('Functional Tests', function () {
  let thread, reply;

  beforeEach(async function () {
    thread = await getThreadId("test", "test");
    reply = await getReplyId(thread._id.toString());
  });

  afterEach(async function () {
    await Thread.deleteMany({ board: "test" }); // Cleanup after each test
  });

  describe("Thread Tests", function () {
    test("#1 POST: Creating a new thread", function (done) {
      chai.request(server)
        .post("/api/threads/test")
        .send(threadPostData)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.isDefined(res.body._id);
          assert.isArray(res.body.replies);
          done();
        });
    });

    test("#2 GET: Viewing the 10 most recent threads with 3 replies each", function (done) {
      chai.request(server)
        .get("/api/threads/test")
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isObject(res.body[0]);
          assert.isDefined(res.body[0].text);
          assert.isDefined(res.body[0].created_on);
          assert.isDefined(res.body[0].bumped_on);
          assert.isArray(res.body[0].replies);
          assert.isBelow(res.body[0].replies.length, 4);
          done();
        });
    });

    test("#3 DELETE: Deleting a thread with the incorrect password", function (done) {
      chai.request(server)
        .delete("/api/threads/test")
        .send({
          ...threadPostData,
          thread_id: thread._id.toString(),
          delete_password: "incorrect"
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });

    test("#4 DELETE: Deleting a thread with the correct password", function (done) {
      chai.request(server)
        .delete("/api/threads/test")
        .send({
          ...threadPostData,
          thread_id: thread._id.toString(),
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });

    test("#5 PUT: Reporting a thread", function (done) {
      chai.request(server)
        .put("/api/threads/test")
        .send({
          thread_id: thread._id.toString(),
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "reported");
          done();
        });
    });
  });

  describe("Reply Tests", function () {
    test("#6 POST: Creating a new reply", function (done) {
      chai.request(server)
        .post("/api/replies/test")
        .send({
          ...replyData,
          thread_id: thread._id.toString(),
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.isDefined(res.body._id);
          assert.isArray(res.body.replies);
          assert.isObject(res.body.replies[0]);
          assert.isDefined(res.body.replies[0].text);
          assert.isDefined(res.body.replies[0].created_on);
          done();
        });
    });

    test("#7 GET: Viewing a single thread with all replies", function (done) {
      chai.request(server)
        .get(`/api/replies/test?thread_id=${thread._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.isDefined(res.body.text);
          assert.isDefined(res.body.created_on);
          assert.isDefined(res.body.bumped_on);
          assert.isArray(res.body.replies);
          assert.isObject(res.body.replies[0]);
          assert.isDefined(res.body.replies[0].text);
          assert.isDefined(res.body.replies[0].created_on);
          done();
        });
    });

    test("#8 DELETE: Deleting a reply with the incorrect password", function (done) {
      chai.request(server)
        .delete("/api/replies/test")
        .send({
          thread_id: thread._id.toString(),
          reply_id: reply._id.toString(),
          delete_password: "incorrect",
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });

    test("#9 DELETE: Deleting a reply with the correct password", function (done) {
      chai.request(server)
        .delete("/api/replies/test")
        .send({
          thread_id: thread._id.toString(),
          reply_id: reply._id.toString(),
          delete_password: reply.delete_password || "test",
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });

    test("#10 PUT: Reporting a reply", function (done) {
      chai.request(server)
        .put("/api/replies/test")
        .send({
          thread_id: thread._id.toString(),
          reply_id: reply._id.toString(),
          board: "test",
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.text, "reported");
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
