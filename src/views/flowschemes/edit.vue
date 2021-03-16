<template>
  <flow-scheme-dtl :is-edit="true"></flow-scheme-dtl>
</template>

<script>
import flowSchemeDtl from "./components/flowSchemeDtl";
import { mapActions } from "vuex";

export default {
  name: "editFlowscheme",
  created() {
    // console.log(this.$route);
  },
  beforeRouteEnter(to, from, next) {
    console.log(from);
    next((vm) => {
      vm.saveCurrentSelect("");
    });
  },
  components: { flowSchemeDtl },
  methods: {
    ...mapActions(["saveCurrentSelect"]),
  },
};
</script>

