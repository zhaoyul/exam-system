(ns zhaoyul.exam-system-backend.domain.auth
  (:require
   [cheshire.core :as json]
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db])
  (:import
   [java.nio.charset StandardCharsets]
   [java.security MessageDigest]
   [java.time Instant]
   [java.util Base64]))

(defn- sha256 [value]
  (let [digest (.digest (MessageDigest/getInstance "SHA-256")
                        (.getBytes (str value) StandardCharsets/UTF_8))]
    (apply str (map #(format "%02x" (bit-and % 0xff)) digest))))

(defn password-hash [username password]
  (sha256 (str (str/lower-case username) ":" password)))

(defn password-valid? [user password]
  (= (:password_hash user)
     (password-hash (:username user) password)))

(defn find-user [ds username]
  (db/execute-one!
   ds
   ["SELECT id, username, password_hash, display_name, role, org_id, phone, status, created_at, updated_at
     FROM app_user
     WHERE lower(username) = lower(?)"
    username]))

(defn- find-mdm-person [ds username]
  (db/execute-one!
   ds
   ["SELECT * FROM mdm_person
     WHERE lower(employee_no) = lower(?) OR phone = ?
     LIMIT 1"
    username username]))

(defn ensure-4a-user!
  "Map a 4A account to local app_user. If the account exists in MDM but not in app_user,
   create a local externally-managed user so 4A can complete the login flow."
  [ds username]
  (or (find-user ds username)
      (when-let [person (find-mdm-person ds username)]
        (let [id (db/uuid)
              display-name (:name person)
              org-id (:org_id person)
              role "user"]
          (db/execute! ds
                       ["INSERT INTO app_user (id, username, password_hash, display_name, role, org_id, phone, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?, 'active')"
                        id username (password-hash username (str "4A:" id)) display-name role org-id (:phone person)])
          (db/execute! ds
                       ["INSERT INTO audit_log (id, action, resource, resource_id, payload)
                         VALUES (?, '4a-user-provision', 'app_user', ?, ?)"
                        (db/uuid) id (db/json-str {:username username :mdmPersonId (:id person)})])
          (find-user ds username)))))

(defn public-user [user]
  (when user
    (-> user
        (dissoc :password_hash)
        (assoc :displayName (:display_name user)
               :orgId (:org_id user)
               :createdAt (:created_at user)
               :updatedAt (:updated_at user))
        (dissoc :display_name :org_id :created_at :updated_at))))

(defn- b64url-encode [value]
  (.encodeToString (Base64/getUrlEncoder)
                   (.getBytes value StandardCharsets/UTF_8)))

(defn- b64url-decode [value]
  (String. (.decode (Base64/getUrlDecoder) value) StandardCharsets/UTF_8))

(defn issue-token [config user]
  (let [now (.getEpochSecond (Instant/now))
        exp (+ now (long (get-in config [:auth :token-ttl-seconds] 28800)))
        payload {:sub (:id user) :username (:username user) :role (:role user) :org_id (:org_id user) :exp exp}
        body (b64url-encode (json/generate-string payload))
        signature (sha256 (str body "." (get-in config [:auth :token-secret])))]
    (str body "." signature)))

(defn verify-token [config token]
  (when (and token (str/includes? token "."))
    (let [[body signature] (str/split token #"\." 2)
          expected (sha256 (str body "." (get-in config [:auth :token-secret])))]
      (when (= signature expected)
        (let [claims (json/parse-string (b64url-decode body) true)
              now (.getEpochSecond (Instant/now))]
          (when (> (long (:exp claims 0)) now)
            claims))))))

(defn bearer-token [request]
  (when-let [authorization (get-in request [:headers "authorization"])]
    (second (re-matches #"(?i)Bearer\s+(.+)" authorization))))
