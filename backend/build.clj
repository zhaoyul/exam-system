(ns build
  (:require [clojure.java.shell :as shell]
            [clojure.string :as string]
            [clojure.tools.build.api :as b]))

(def lib 'zhaoyul/exam-system-backend)
(def main-cls (string/join "." (filter some? [(namespace lib) (name lib) "core"])))
(def version (format "0.0.1-SNAPSHOT"))
(def target-dir "target")
(def class-dir (str target-dir "/" "classes"))
(def uber-file (format "%s/%s-standalone.jar" target-dir (name lib)))
(def basis (b/create-basis {:project "deps.edn"}))
(def frontend-dir "../app")
(def frontend-dist-dir (str frontend-dir "/dist"))

(defn clean
  "Delete the build target directory"
  [_]
  (println (str "Cleaning " target-dir))
  (b/delete {:path target-dir}))

(defn prep [_]
  (println "Writing Pom...")
  (b/write-pom {:class-dir class-dir
                :lib lib
                :version version
                :basis basis
                :src-dirs ["src/clj"]})
  (b/copy-dir {:src-dirs ["src/clj" "resources" "env/prod/resources" "env/prod/clj"]
               :target-dir class-dir}))

(defn build-frontend [_]
  (println "Installing frontend dependencies...")
  (let [{:keys [exit out err]} (shell/sh "npm" "install" :dir frontend-dir)]
    (when (seq out) (println out))
    (when-not (zero? exit)
      (binding [*out* *err*]
        (println err))
      (throw (ex-info "npm install failed" {:exit exit}))))
  (println "Building frontend...")
  (let [{:keys [exit out err]} (shell/sh "npm" "run" "build" :dir frontend-dir)]
    (when (seq out) (println out))
    (when-not (zero? exit)
      (binding [*out* *err*]
        (println err))
      (throw (ex-info "npm run build failed" {:exit exit}))))
  (println "Copying frontend assets into classpath public/...")
  (b/copy-dir {:src-dirs [frontend-dist-dir]
               :target-dir (str class-dir "/public")}))

(defn uber [_]
  (println "Compiling Clojure...")
  (b/compile-clj {:basis basis
                  :src-dirs ["src/clj" "resources" "env/prod/resources" "env/prod/clj"]
                  :class-dir class-dir})
  (println "Making uberjar...")
  (b/uber {:class-dir class-dir
           :uber-file uber-file
           :main main-cls
           :basis basis}))

(defn all [_]
  (do (clean nil) (prep nil) (build-frontend nil) (uber nil)))
