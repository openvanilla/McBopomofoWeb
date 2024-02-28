import tornado.ioloop
import tornado.web
import sys
import os
import uuid  # use to generate a random auth token
import random
import json

current_dir = os.path.dirname(__file__)

config_dir = os.path.join(os.path.expandvars("%APPDATA%"), "PIME", "mcbopomofo")
localdata_dir = os.path.join(os.path.expandvars("%LOCALAPPDATA%"), "PIME", "mcbopomofo")

COOKIE_ID = "mcbopomofo_config_token"
SERVER_TIMEOUT = 120
DEFAULT_CONFIG = {
    "layout": "standard",
    "select_phrase": "before_cursor",
    "candidate_keys": "123456789",
    "esc_key_clear_entire_buffer": False,
    "shift_key_toggle_alphabet_mode": True,
    "chineseConversion": False,
    "move_cursor": True,
    "letter_mode": "upper",
}


class BaseHandler(tornado.web.RequestHandler):

    def get_current_user(self):  # override the login check
        return self.get_cookie(COOKIE_ID)

    def prepare(self):  # called before every request
        self.application.reset_timeout()  # reset the quit server timeout


class KeepAliveHandler(BaseHandler):

    @tornado.web.authenticated
    def get(self):
        # the actual keep-alive is done inside BaseHandler.prepare()
        self.write('{"return":true}')


class ConfigHandler(BaseHandler):

    def get_current_user(self):  # override the login check
        return self.get_cookie(COOKIE_ID)

    @tornado.web.authenticated
    def get(self):  # get config
        data = ""
        try:
            data = self.load_config()
        except:
            pass
        self.write(data)

    @tornado.web.authenticated
    def post(self):  # save config
        data = tornado.escape.json_decode(self.request.body)
        os.makedirs(config_dir, exist_ok=True)
        self.save_file("config.json", json.dumps(data, indent=2))
        self.write('{"return":true}')

    def load_config(self):
        config = DEFAULT_CONFIG  # the default settings
        try:
            with open(
                os.path.join(config_dir, "config.json"), "r", encoding="UTF-8"
            ) as f:
                # override default values with user config
                config.update(json.load(f))
        except Exception as e:
            print(e)
        return config


class LoginHandler(BaseHandler):
    def post(self, page_name):
        token = self.get_argument("token", "")
        if token == self.settings["access_token"]:
            self.set_cookie(COOKIE_ID, token)
            page_name = "options"
            self.redirect("/{}.html".format(page_name))


class ConfigApp(tornado.web.Application):

    def __init__(self):
        # generate a new auth token using UUID
        self.access_token = uuid.uuid4().hex
        settings = {
            "access_token": self.access_token,  # our custom setting
            "login_url": "/version",
            "debug": True,
        }
        handlers = [
            (r"/(.*\.html)", tornado.web.StaticFileHandler, {"path": current_dir}),
            (
                r"/((css|images|js|fonts)/.*)",
                tornado.web.StaticFileHandler,
                {"path": current_dir},
            ),
            (
                r"/(version.txt)",
                tornado.web.StaticFileHandler,
                {"path": os.path.join(current_dir, "../../../")},
            ),
            (r"/config", ConfigHandler),  # main configuration handler
            (r"/keep_alive", KeepAliveHandler),  # keep the api server alive
            (r"/login/(.*)", LoginHandler),  # authentication
        ]
        super().__init__(handlers, **settings)
        self.timeout_handler = None
        self.port = 0

    def launch_browser(self, tool_name="options"):
        user_html = """<html>
    <form id="auth" action="http://127.0.0.1:{PORT}/login/{PAGE_NAME}" method="POST">
        <input type="hidden" name="token" value="{TOKEN}">
    </form>
    <script type="text/javascript">
        document.getElementById("auth").submit();
    </script>
    </html>""".format(
            PORT=self.port, PAGE_NAME=tool_name, TOKEN=self.access_token
        )
        # use a local html file to send access token to our service via http POST for authentication.
        os.makedirs(localdata_dir, exist_ok=True)
        filename = "launch_{}.html".format(tool_name)
        # filename = os.path.join(localdata_dir, filename)
        with open(filename, "w") as f:
            f.write(user_html)
            os.startfile(filename)

    def run(self, tool_name):
        # find a port number that's available
        random.seed()
        while True:
            port = random.randint(1025, 65535)
            try:
                self.listen(port, "127.0.0.1")
                break
            except (
                OSError
            ):  # it's possible that the port we want to use is already in use
                continue
        self.port = port

        self.launch_browser(tool_name)

        # setup the main event loop
        loop = tornado.ioloop.IOLoop.current()
        self.timeout_handler = loop.call_later(SERVER_TIMEOUT, self.quit)
        loop.start()

    def reset_timeout(self):
        loop = tornado.ioloop.IOLoop.current()
        if self.timeout_handler:
            loop.remove_timeout(self.timeout_handler)
            self.timeout_handler = loop.call_later(SERVER_TIMEOUT, self.quit)

    def quit(self):
        # terminate the server process
        tornado.ioloop.IOLoop.current().close()
        sys.exit(0)


def main():
    app = ConfigApp()
    if len(sys.argv) >= 2 and sys.argv[1] == "user_phrase_editor":
        tool_name = "user_phrase_editor"
    else:
        tool_name = "options"
    app.run(tool_name)


if __name__ == "__main__":
    main()
