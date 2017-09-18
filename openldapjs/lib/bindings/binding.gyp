{
  'targets': [
    {
      'target_name': 'binding',
      'defines': [ 'V8_DEPRECATION_WARNINGS=1' ],
      'include_dirs' : [
         "<!(node -e \"require('nan')\")",
        '/usr/local/include'
      ],
      'sources': [ 'binding.cc', 'ldap_control.cc','ldap_bind_progress.cc',
            'ldap_search_progress.cc','ldap_add_progress.cc','ldap_delete_progress.cc',
            'ldap_modify_progress.cc','ldap_rename_progress.cc','ldap_compare_progress.cc'],
      'ldflags': [
            '-Wl,-z,defs'
      ],
      'libraries': [
         '-lldap',
         '-llber'
      ],
      'defines': [
          'LDAP_DEPRECATED'
      ],
      'ldflags': [
          '-L/usr/local/lib'
      ],
      'cflags': [
          '-Wall',
          '-g',
          '-std=c++11',
          '-Wno-reorder'
      ],
      'cflags!': ['-fno-exceptions'],
      'cflags_cc!': ['-fno-exceptions']
    }
  ]
}


