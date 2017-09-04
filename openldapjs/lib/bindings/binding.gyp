{
  'targets': [
    {
      'target_name': 'binding',
      'defines': [ 'V8_DEPRECATION_WARNINGS=1' ],
      'include_dirs' : [
        "<!(node -e \"require('nan')\")",
        "/usr/local/include"
      ],
      'sources': [ 'binding.cc'],
      "ldflags": [
            "-Wl,-z,defs"
      ],
      'libraries': [
         "-lldap",
         "-llber"
      ],
      "defines": [
          "LDAP_DEPRECATED"
      ],
      "ldflags": [
          "-L/usr/local/lib"
      ],
      "cflags": [
          "-Wall",
          "-g",
          "-std=c++11",
          "-Wreorder"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"]
    }
  ]
}


