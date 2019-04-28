import axios from "axios";

import {
    config
} from "../config";

class AdminManager {

    resetManualCount() {
        return axios.post(config.backend.url + config.backend.endpoints.reset_counter).then((response) => {
            console.log("Resetting success");
        });
    }

}

export const adminManager = new AdminManager();
