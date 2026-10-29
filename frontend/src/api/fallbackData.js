/**
 * frontend/src/api/fallbackData.js
 * ---------------------------------
 * Reliable fallback laboratory dataset from NSL-KDD benchmarks.
 * Prevents "fetch failed" and empty blank states when the backend is offline.
 */

export const FALLBACK_SAMPLES = [
  {
    id: "sample-1",
    name: "Normal Web Browsing",
    scenario: "Benign HTTP session with regular request/response payload.",
    expected_threat: "NORMAL",
    expected_protocol: "http",
    features: {
      duration: 0.0, protocol_type: "tcp", service: "http", flag: "SF",
      src_bytes: 232.0, dst_bytes: 8153.0, land: 0, wrong_fragment: 0,
      urgent: 0, hot: 0, num_failed_logins: 0, logged_in: 1,
      num_compromised: 0, root_shell: 0, su_attempted: 0, num_root: 0,
      num_file_creations: 0, num_shells: 0, num_access_files: 0,
      num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0,
      count: 5, srv_count: 5, serror_rate: 0.2, srv_serror_rate: 0.2,
      rerror_rate: 0.0, srv_rerror_rate: 0.0, same_srv_rate: 1.0,
      diff_srv_rate: 0.0, srv_diff_host_rate: 0.0, dst_host_count: 30,
      dst_host_srv_count: 255, dst_host_same_srv_rate: 1.0,
      dst_host_diff_srv_rate: 0.0, dst_host_same_src_port_rate: 0.03,
      dst_host_srv_diff_host_rate: 0.04, dst_host_serror_rate: 0.03,
      dst_host_srv_serror_rate: 0.01, dst_host_rerror_rate: 0.0,
      dst_host_srv_rerror_rate: 0.01
    }
  },
  {
    id: "sample-2",
    name: "Neptune SYN Flood (DoS)",
    scenario: "Denial of Service attack flooding SYN packets with zero payload and 100% SYN error rate.",
    expected_threat: "ATTACK",
    expected_protocol: "other",
    features: {
      duration: 0.0, protocol_type: "tcp", service: "private", flag: "S0",
      src_bytes: 0.0, dst_bytes: 0.0, land: 0, wrong_fragment: 0,
      urgent: 0, hot: 0, num_failed_logins: 0, logged_in: 0,
      num_compromised: 0, root_shell: 0, su_attempted: 0, num_root: 0,
      num_file_creations: 0, num_shells: 0, num_access_files: 0,
      num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0,
      count: 123, srv_count: 6, serror_rate: 1.0, srv_serror_rate: 1.0,
      rerror_rate: 0.0, srv_rerror_rate: 0.0, same_srv_rate: 0.05,
      diff_srv_rate: 0.07, srv_diff_host_rate: 0.0, dst_host_count: 255,
      dst_host_srv_count: 26, dst_host_same_srv_rate: 0.1,
      dst_host_diff_srv_rate: 0.05, dst_host_same_src_port_rate: 0.0,
      dst_host_srv_diff_host_rate: 0.0, dst_host_serror_rate: 1.0,
      dst_host_srv_serror_rate: 1.0, dst_host_rerror_rate: 0.0,
      dst_host_srv_rerror_rate: 0.0
    }
  },
  {
    id: "sample-3",
    name: "Port Sweep Probe",
    scenario: "Reconnaissance attack scanning multiple ports, triggering rejection errors (REJ).",
    expected_threat: "ATTACK",
    expected_protocol: "other",
    features: {
      duration: 0.0, protocol_type: "tcp", service: "private", flag: "REJ",
      src_bytes: 0.0, dst_bytes: 0.0, land: 0, wrong_fragment: 0,
      urgent: 0, hot: 0, num_failed_logins: 0, logged_in: 0,
      num_compromised: 0, root_shell: 0, su_attempted: 0, num_root: 0,
      num_file_creations: 0, num_shells: 0, num_access_files: 0,
      num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0,
      count: 229, srv_count: 10, serror_rate: 0.0, srv_serror_rate: 0.0,
      rerror_rate: 1.0, srv_rerror_rate: 1.0, same_srv_rate: 0.04,
      diff_srv_rate: 0.06, srv_diff_host_rate: 0.0, dst_host_count: 255,
      dst_host_srv_count: 10, dst_host_same_srv_rate: 0.04,
      dst_host_diff_srv_rate: 0.06, dst_host_same_src_port_rate: 0.0,
      dst_host_srv_diff_host_rate: 0.0, dst_host_serror_rate: 0.0,
      dst_host_srv_serror_rate: 0.0, dst_host_rerror_rate: 1.0,
      dst_host_srv_rerror_rate: 1.0
    }
  },
  {
    id: "sample-4",
    name: "FTP File Transfer",
    scenario: "Legitimate FTP data connection transferring files over port 20.",
    expected_threat: "NORMAL",
    expected_protocol: "ftp_data",
    features: {
      duration: 2.0, protocol_type: "tcp", service: "ftp_data", flag: "SF",
      src_bytes: 12983.0, dst_bytes: 0.0, land: 0, wrong_fragment: 0,
      urgent: 0, hot: 0, num_failed_logins: 0, logged_in: 0,
      num_compromised: 0, root_shell: 0, su_attempted: 0, num_root: 0,
      num_file_creations: 0, num_shells: 0, num_access_files: 0,
      num_outbound_cmds: 0, is_host_login: 0, is_guest_login: 0,
      count: 1, srv_count: 1, serror_rate: 0.0, srv_serror_rate: 0.0,
      rerror_rate: 0.0, srv_rerror_rate: 0.0, same_srv_rate: 1.0,
      diff_srv_rate: 0.0, srv_diff_host_rate: 0.0, dst_host_count: 134,
      dst_host_srv_count: 86, dst_host_same_srv_rate: 0.61,
      dst_host_diff_srv_rate: 0.04, dst_host_same_src_port_rate: 0.61,
      dst_host_srv_diff_host_rate: 0.02, dst_host_serror_rate: 0.0,
      dst_host_srv_serror_rate: 0.0, dst_host_rerror_rate: 0.0,
      dst_host_srv_rerror_rate: 0.0
    }
  }
];

export const FALLBACK_METRICS = {
  task_a: {
    decision_tree: {
      accuracy: 0.7827,
      precision_weighted: 0.8386,
      recall_weighted: 0.7827,
      f1_weighted: 0.7806,
      precision_macro: 0.8183,
      recall_macro: 0.8054,
      f1_macro: 0.7821,
      predict_time: 0.0803,
      train_time: 3.3336,
      classes: ["0", "1"],
      confusion_matrix: [[9411, 300], [4598, 8235]]
    },
    svm: {
      accuracy: 0.7725,
      precision_weighted: 0.8339,
      recall_weighted: 0.7725,
      f1_weighted: 0.7696,
      precision_macro: 0.8128,
      recall_macro: 0.7966,
      f1_macro: 0.7716,
      predict_time: 7.6967,
      train_time: 8.6475,
      classes: ["0", "1"],
      confusion_matrix: [[9420, 291], [4837, 7996]]
    },
    naive_bayes: {
      accuracy: 0.7107,
      precision_weighted: 0.7513,
      recall_weighted: 0.7107,
      f1_weighted: 0.7093,
      precision_macro: 0.7259,
      recall_macro: 0.7152,
      f1_macro: 0.7104,
      predict_time: 0.0898,
      train_time: 0.4496,
      classes: ["0", "1"],
      confusion_matrix: [[7892, 1819], [4703, 8130]]
    }
  },
  task_b: {
    decision_tree: {
      accuracy: 0.8407,
      precision_weighted: 0.8227,
      recall_weighted: 0.8407,
      f1_weighted: 0.8293,
      precision_macro: 0.6974,
      recall_macro: 0.6728,
      f1_macro: 0.6835,
      predict_time: 0.0768,
      train_time: 3.4975,
      classes: ["daytime", "domain_u", "ftp", "ftp_data", "http", "other", "smtp", "telnet"],
      confusion_matrix: [
        [0, 0, 0, 0, 0, 5, 0, 0],
        [0, 10, 0, 0, 0, 2, 0, 0],
        [0, 0, 203, 115, 0, 182, 0, 0],
        [0, 0, 56, 755, 0, 41, 0, 0],
        [0, 0, 0, 0, 7737, 118, 0, 0],
        [0, 0, 25, 33, 276, 9662, 2, 38],
        [0, 0, 0, 0, 0, 137, 800, 0],
        [0, 0, 0, 0, 0, 2747, 0, 56]
      ]
    },
    svm: {
      accuracy: 0.8297,
      precision_weighted: 0.8037,
      recall_weighted: 0.8297,
      f1_weighted: 0.8115,
      precision_macro: 0.6391,
      recall_macro: 0.5891,
      f1_macro: 0.6094,
      predict_time: 9.3807,
      train_time: 8.6806,
      classes: ["daytime", "domain_u", "ftp", "ftp_data", "http", "other", "smtp", "telnet"],
      confusion_matrix: [
        [0, 0, 0, 0, 0, 5, 0, 0],
        [0, 7, 0, 0, 0, 5, 0, 0],
        [0, 0, 169, 131, 0, 200, 0, 0],
        [0, 0, 68, 735, 0, 49, 0, 0],
        [0, 0, 0, 0, 7709, 146, 0, 0],
        [0, 0, 20, 43, 290, 9637, 2, 44],
        [0, 0, 0, 0, 0, 150, 787, 0],
        [0, 0, 0, 0, 0, 2772, 0, 31]
      ]
    },
    naive_bayes: {
      accuracy: 0.5284,
      precision_weighted: 0.7932,
      recall_weighted: 0.5284,
      f1_weighted: 0.5701,
      precision_macro: 0.4419,
      recall_macro: 0.5186,
      f1_macro: 0.4286,
      predict_time: 0.0882,
      train_time: 0.3813,
      classes: ["daytime", "domain_u", "ftp", "ftp_data", "http", "other", "smtp", "telnet"],
      confusion_matrix: [
        [0, 0, 0, 0, 0, 5, 0, 0],
        [0, 12, 0, 0, 0, 0, 0, 0],
        [0, 0, 260, 91, 0, 149, 0, 0],
        [0, 0, 89, 712, 0, 51, 0, 0],
        [0, 0, 0, 0, 7622, 233, 0, 0],
        [0, 0, 12, 45, 1204, 3014, 1, 5760],
        [0, 0, 0, 0, 0, 210, 727, 0],
        [0, 0, 0, 0, 0, 2243, 0, 560]
      ]
    }
  }
};

export const FALLBACK_FEATURE_IMPORTANCE = {
  task_a: [
    { feature: "src_bytes", importance: 0.6401 },
    { feature: "service_ecr_i", importance: 0.0875 },
    { feature: "diff_srv_rate", importance: 0.0795 },
    { feature: "service_http", importance: 0.0422 },
    { feature: "hot", importance: 0.0405 },
    { feature: "dst_bytes", importance: 0.0299 },
    { feature: "dst_host_same_src_port_rate", importance: 0.0239 },
    { feature: "service_ftp_data", importance: 0.0130 },
    { feature: "dst_host_srv_count", importance: 0.0071 },
    { feature: "duration", importance: 0.0069 },
    { feature: "service_domain_u", importance: 0.0053 },
    { feature: "dst_host_diff_srv_rate", importance: 0.0044 },
    { feature: "dst_host_srv_diff_host_rate", importance: 0.0038 },
    { feature: "count", importance: 0.0033 },
    { feature: "protocol_type_udp", importance: 0.0028 }
  ],
  task_b: [
    { feature: "src_bytes", importance: 0.4497 },
    { feature: "dst_bytes", importance: 0.1764 },
    { feature: "protocol_type_udp", importance: 0.1265 },
    { feature: "flag_SF", importance: 0.0984 },
    { feature: "dst_host_srv_count", importance: 0.0489 },
    { feature: "count", importance: 0.0261 },
    { feature: "dst_host_same_srv_rate", importance: 0.0203 },
    { feature: "duration", importance: 0.0132 },
    { feature: "dst_host_count", importance: 0.0097 },
    { feature: "same_srv_rate", importance: 0.0068 },
    { feature: "srv_count", importance: 0.0061 },
    { feature: "diff_srv_rate", importance: 0.0045 },
    { feature: "dst_host_same_src_port_rate", importance: 0.0039 },
    { feature: "logged_in", importance: 0.0031 },
    { feature: "protocol_type_icmp", importance: 0.0024 }
  ]
};
