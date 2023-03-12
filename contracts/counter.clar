
;; title: counter
;; version: 1.0.0
;; summary: Multiplayer counter contract
;; description: A multuplayer game that increases count

;; traits
;;

;; token definitions
;; 

;; constants
;;

;; data vars
;;

;; data maps
(define-map counter principal uint)

;; public functions
(define-public (count-up) 
  (begin 
    (ok (map-set counter tx-sender (+ (get-count tx-sender) u1)))
  )
)

;; read only functions
(define-read-only (get-count (caller principal)) 
  ;; Clarity has a built-in function called default-to that takes 
  ;; a default value and an optional type. If the optional type 
  ;; is a (some ...), it will unwrap and return it. If it is a none, 
  ;; then it will return the specified default value.
  (default-to u0 (map-get? counter caller))
)

;; private functions
;;

