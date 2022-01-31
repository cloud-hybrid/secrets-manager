import OS from "os";

import { fromIni } from "@aws-sdk/credential-providers";

import { CredentialProvider } from "@aws-sdk/types";

/***
 * Client Credentials
 * ---
 *
 * Creates a credential provider function that reads from a shared credentials file at ~/.aws/credentials and a shared
 * configuration file at ~/.aws/config.
 *
 * Both files are expected to be INI formatted with section names corresponding to
 * profiles.
 *
 * Sections in the credentials file are treated as profile names, whereas profile sections in the config file
 * must have the format of[profile profile-name], except for the default profile.
 *
 * @example
 * const Credentials = new Client();
 * await Credentials.initialize();
 *
 * console.log(Credentials);
 *
 */

class Credential {
    /***
     * Returns information about the currently effective user. On POSIX platforms, this is typically a subset of the
     * password file. The returned object includes the username, uid, gid, shell, and homedir. On Windows, the uid
     * and gid fields are -1, and shell is null. The value of homedir returned by os.userInfo() is provided by the
     * operating system. This differs from the result of os.homedir(), which queries environment variables for the home
     * directory before falling back to the operating system response.
     *
     * Throws a SystemError if a user has no username or homedir.
     *
     */

    user = OS.userInfo();

    /*** `AWS_PROFILE` environment variable or a default of `default`. */
    profile: string;

    /*** AWS_ACCESS_KEY_ID */
    id?: string;

    /*** AWS_SECRET_ACCESS_KEY */
    key?: string;

    /***
     * A function that, when invoked, returns a promise that will be fulfilled with a value of type Credential
     *
     * @type {import("@aws-sdk/types").CredentialProvider}
     * */

    settings: CredentialProvider;

    /***
     *
     * @param profile {string} Defaults to `default`
     *
     */

    constructor(profile: string) {
        this.profile = profile;

        this.settings = fromIni( {
            profile: profile
        } );
    }
}

export { Credential };

export default Credential;