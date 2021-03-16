import request from "@/utils/request";

export function load(params) {
  return request({
    url: "/newss/load",
    method: "get",
    params,
  });
}
export function get(params) {
  return request({
    url: "/newss/get",
    method: "get",
    params,
  });
}

export function add(data) {
  return request({
    url: "/newss/add",
    method: "post",
    data,
  });
}

export function update(data) {
  return request({
    url: "/newss/update",
    method: "post",
    data,
  });
}

export function remove(data) {
  return request({
    url: "/newss/delete",
    method: "post",
    data,
  });
}
