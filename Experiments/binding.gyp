{
  'targets': [
    {
      'target_name': 'binding',
      'defines': [ 'V8_DEPRECATION_WARNINGS=1' ],
      'include_dirs' : [
        "<!(node -e \"require('nan')\")",
				"/usr/local/include"
      ],
      'sources': [ 'binding.cc' ],
			"ldflags": [
            "-Wl,-z,defs"
      ],
      'libraries': [],
      "defines": [
          "LDAP_DEPRECATED"
      ],
      "ldflags": [
          "-L/usr/local/lib"
      ],
      "cflags": [
          "-Wall",
          "-g"
      ],
    }
  ]
}

